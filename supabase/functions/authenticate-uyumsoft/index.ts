
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

// Uyumsoft API endpoints
const UYUMSOFT_TEST_API = 'https://efatura-test.uyumsoft.com.tr/Services/Integration'
const UYUMSOFT_PROD_API = 'https://edonusumapi.uyum.com.tr/Services/Integration'

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

    console.log('Uyumsoft authentication attempt:', { username, testMode })

    // Select the correct API endpoint based on test mode
    const apiEndpoint = testMode ? UYUMSOFT_TEST_API : UYUMSOFT_PROD_API
    console.log('Using endpoint:', apiEndpoint)

    // Prepare SOAP envelope for Uyumsoft authentication
    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <TestConnection xmlns="http://tempuri.org/">
      <kullaniciadi>${username}</kullaniciadi>
      <sifre>${password}</sifre>
    </TestConnection>
  </soap:Body>
</soap:Envelope>`;

    console.log('Sending SOAP request to:', apiEndpoint)

    // Try to authenticate with Uyumsoft using SOAP API
    const authResponse = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://tempuri.org/IIntegration/TestConnection'
      },
      body: soapEnvelope
    })

    console.log('Response status:', authResponse.status)
    const responseText = await authResponse.text()
    console.log('Response text:', responseText)

    if (!authResponse.ok) {
      throw new Error(`HTTP error! status: ${authResponse.status}`)
    }

    // Parse SOAP response
    const isSuccessful = responseText.includes('<TestConnectionResult>true</TestConnectionResult>') || 
                        responseText.includes('>true<') ||
                        !responseText.includes('fault') && !responseText.includes('error');

    if (!isSuccessful) {
      throw new Error('Uyumsoft kimlik doğrulama başarısız - geçersiz kullanıcı adı veya şifre')
    }

    // If authentication successful, save/update the account
    const accountData = {
      username,
      password_encrypted: password, // In production, this should be encrypted
      company_code: '', // Required field but not used
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
          company_id: companyId
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
        account: savedAccount
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
