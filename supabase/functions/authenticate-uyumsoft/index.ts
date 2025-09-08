
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AuthRequest {
  companyId: string
  username: string
  password: string
  testMode?: boolean
}

// Uyumsoft SOAP API integration endpoint - same for test and production
const UYUMSOFT_INTEGRATION_BASE = 'https://edonusumapi.uyum.com.tr/Services/Integration'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { companyId, username, password, testMode = true }: AuthRequest = await req.json()

    // Prepare SOAP authentication request for Uyumsoft
    const authPayload = {
      kullaniciadi: username,
      sifre: password
    }

    console.log('Uyumsoft authentication attempt:', { username, testMode })

    // Try to authenticate with Uyumsoft using SOAP API
    const authResponse = await fetch(UYUMSOFT_INTEGRATION_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'SOAPAction': 'http://tempuri.org/IIntegration/TestConnection'
      },
      body: JSON.stringify(authPayload)
    })

    let authResult
    try {
      authResult = await authResponse.json()
    } catch (error) {
      console.error('Failed to parse Uyumsoft response:', error)
      authResult = { success: false, message: 'Invalid response from Uyumsoft' }
    }

    console.log('Uyumsoft auth response:', authResult)

    if (!authResponse.ok || !authResult.success) {
      throw new Error(authResult.message || 'Uyumsoft kimlik doğrulama başarısız')
    }

    // If authentication successful, save/update the account
    const accountData = {
      username,
      password_encrypted: password, // In production, this should be encrypted
      test_mode: testMode,
      is_active: true,
      last_sync_at: new Date().toISOString()
    }

    // Check if account exists
    const { data: existingAccount } = await supabaseClient
      .from('uyumsoft_accounts')
      .select('id')
      .eq('company_id', companyId)
      .maybeSingle()

    let savedAccount
    if (existingAccount) {
      // Update existing account
      const { data, error } = await supabaseClient
        .from('uyumsoft_accounts')
        .update({
          ...accountData,
          updated_at: new Date().toISOString(),
        })
        .eq('company_id', companyId)
        .select()
        .single()

      if (error) throw error
      savedAccount = data
    } else {
      // Create new account
      const { data, error } = await supabaseClient
        .from('uyumsoft_accounts')
        .insert({ 
          ...accountData, 
          company_id: companyId,
        })
        .select()
        .single()

      if (error) throw error
      savedAccount = data
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Uyumsoft bağlantısı başarılı',
        account: savedAccount,
        authenticator: authResult.authenticator || authResult.token
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Uyumsoft authentication error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Bağlantı hatası'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
