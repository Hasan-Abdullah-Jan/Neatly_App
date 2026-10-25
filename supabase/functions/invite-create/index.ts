/**
 * Edge Function: invite-create
 * Creates an invitation with a hashed token. Returns an invite link and QR payload.
 * Only callable by users with roles.manage in the organization.
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

    const { org_id, email, phone, role_id, scopes, expires_in_days = 7 } = await req.json();
    if (!org_id || !role_id) {
      return new Response(JSON.stringify({ error: 'org_id and role_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify permission: roles.manage
    const { data: hasPerm, error: permError } = await supabaseClient.rpc('app_has_perm', {
      target_org_id: org_id,
      perm_key: 'roles.manage',
    });
    if (permError || !hasPerm) {
      return new Response(JSON.stringify({ error: 'Forbidden: roles.manage required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate secure random token
    const token = crypto.randomUUID() + crypto.randomUUID();
    const tokenHash = HmacSHA256(token, Deno.env.get('INVITE_SECRET') ?? 'neatly-invite-secret').toString(enc.Hex);
    const expiresAt = new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000).toISOString();

    const { data: invitation, error: insertError } = await supabaseClient
      .from('invitations')
      .insert({
        org_id,
        email,
        phone,
        role_id,
        scopes: scopes || [],
        token_hash: tokenHash,
        invited_by: user.id,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    const inviteLink = `${Deno.env.get('PUBLIC_URL') ?? 'http://localhost:3000'}/accept-invite/${invitation.id}?token=${token}`;

    return new Response(JSON.stringify({
      invitation,
      invite_link: inviteLink,
      token, // only returned once
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
