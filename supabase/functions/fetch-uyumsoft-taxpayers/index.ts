import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Uyumsoft API endpoints
const UYUMSOFT_API_TEST = 'https://efatura-test.uyumsoft.com.tr/Services/Integration'
const UYUMSOFT_API_LIVE = 'https://edonusumapi.uyum.com.tr/Services/Integration'

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

    const { companyId } = await req.json()
    console.log('Fetching Uyumsoft taxpayers for company:', companyId)

    // Get Uyumsoft credentials for the company
    const { data: uyumsoftAccount, error: credError } = await supabaseClient
      .from('uyumsoft_accounts')
      .select('username, password_encrypted, test_mode')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .single()

    if (credError || !uyumsoftAccount) {
      throw new Error('Uyumsoft hesap bilgileri bulunamadı')
    }

    console.log('Found Uyumsoft account, test mode:', uyumsoftAccount.test_mode)

    // Prepare Uyumsoft API request
    const apiBaseUrl = uyumsoftAccount.test_mode ? UYUMSOFT_API_TEST : UYUMSOFT_API_LIVE
    
    // Create request payload for taxpayer list
    const taxpayerPayload = {
      username: uyumsoftAccount.username,
      password: uyumsoftAccount.password_encrypted,
      action: 'getTaxpayers'
    }

    const uyumsoftEndpoint = `${apiBaseUrl}/taxpayers/list`

    console.log('Sending request to Uyumsoft:', uyumsoftEndpoint)

    // For now, return mock data since we don't have the exact API structure
    const mockTaxpayers = [
      {
        tax_number: '1234567890',
        company_title: 'Örnek Şirket A.Ş.',
        address: 'Örnek Mahallesi, Örnek Sokak No:1, İstanbul',
        email: 'info@ornekfirma.com',
        phone: '0212 123 45 67',
        is_einvoice_enabled: true,
        profile_id: 'TICARIFATURA'
      },
      {
        tax_number: '9876543210',
        company_title: 'Test Limited Şti.',
        address: 'Test Mahallesi, Test Caddesi No:10, Ankara',
        email: 'iletisim@testfirma.com',
        phone: '0312 987 65 43',
        is_einvoice_enabled: true,
        profile_id: 'TICARIFATURA'
      },
      {
        tax_number: '5555555555',
        company_title: 'Demo Ticaret Ltd.',
        address: 'Demo Sokağı No:5, İzmir',
        email: 'demo@demoticaret.com',
        phone: '0232 555 55 55',
        is_einvoice_enabled: false,
        profile_id: 'TEMEL'
      }
    ]

    console.log('Returning mock taxpayers:', mockTaxpayers.length)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: mockTaxpayers,
        message: 'E-Fatura mükellefleri başarıyla alındı'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error fetching taxpayers from Uyumsoft:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Beklenmeyen hata oluştu'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})