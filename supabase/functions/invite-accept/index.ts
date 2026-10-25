/**
 * Edge Function: invite-accept
 * Accepts an invitation by verifying the hashed token.
 * Creates/links the membership and marks the invitation as accepted.
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { HmacSHA256, enc } from 'https://esm.sh/crypto-js@4.2.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { invitation_id, token } = await req.json();
    if (!invitation_id || !token) {
      return new Response(JSON.stringify({ error: 'invitation_id and token required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: invitation, error: fetchError } = await supabaseClient
      .from('invitations')
      .select('*')
      .eq('id', invitation_id)
      .single();

    if (fetchError || !invitation) {
      return new Response(JSON.stringify({ error: 'Invitation not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check expiry
    if (new Date(invitation.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'Invitation expired' }), {
        status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check already accepted or revoked
    if (invitation.accepted_at || invitation.revoked_at) {
      return new Response(JSON.stringify({ error: 'Invitation already used or revoked' }), {
        status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify token hash
    const tokenHash = HmacSHA256(token, Deno.env.get('INVITE_SECRET') ?? 'neatly-invite-secret').toString(enc.Hex);
    if (tokenHash !== invitation.token_hash) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Ensure user profile matches email/phone if provided
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('id, email, phone')
      .eq('id', user.id)
      .single();

    // Create membership
    const { data: membership, error: memError } = await supabaseClient
      .from('memberships')
      .insert({
        user_id: user.id,
        org_id: invitation.org_id,
        role_id: invitation.role_id,
        status: 'active',
        scopes: invitation.scopes,
        created_by: user.id,
      })
      .select()
      .single();

    if (memError) throw memError;

    // Mark invitation accepted
    await supabaseClient
      .from('invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitation_id);

    return new Response(JSON.stringify({
      membership,
      organization_id: invitation.org_id,
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
