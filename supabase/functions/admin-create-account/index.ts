/**
 * Edge Function: admin-create-account
 * Admin creates a staff account without email (phone or username + PIN).
 * Requires people.manage permission.
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createClient as createServiceClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    const { org_id, phone, username, pin, role_id, full_name } = await req.json();
    if (!org_id || (!phone && !username) || !pin || !role_id) {
      return new Response(JSON.stringify({ error: 'org_id, phone or username, pin, and role_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify permission: people.manage
    const { data: hasPerm, error: permError } = await supabaseClient.rpc('app_has_perm', {
      target_org_id: org_id,
      perm_key: 'people.manage',
    });
    if (permError || !hasPerm) {
      return new Response(JSON.stringify({ error: 'Forbidden: people.manage required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Service client to create auth user with phone (admin operation)
    const serviceClient = createServiceClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create the auth user (phone-based)
    const { data: authData, error: createError } = await serviceClient.auth.admin.createUser({
      phone,
      email: username ? `${username}@neatly.internal` : undefined,
      user_metadata: { full_name, phone, username },
      phone_confirm: true, // admin-created, skip confirmation
    });

    if (createError) throw createError;

    const newUserId = authData.user.id;

    // Create profile
    await serviceClient.from('profiles').insert({
      id: newUserId,
      phone,
      username,
      full_name,
      created_by: user.id,
    });

    // Create membership
    await serviceClient.from('memberships').insert({
      user_id: newUserId,
      org_id,
      role_id,
      status: 'active',
      created_by: user.id,
    });

    return new Response(JSON.stringify({
      user_id: newUserId,
      phone,
      username,
      pin_set: true,
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
