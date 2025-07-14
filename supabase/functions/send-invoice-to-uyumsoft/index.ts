
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InvoiceRequest {
  invoiceId: string
  invoiceType: 'e-invoice' | 'e-archive'
}

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

    const { invoiceId, invoiceType }: InvoiceRequest = await req.json()

    // Get invoice data
    let invoiceData
    if (invoiceType === 'e-invoice') {
      const { data, error } = await supabaseClient
        .from('e_invoices')
        .select('*, companies!inner(id, name)')
        .eq('id', invoiceId)
        .single()
      
      if (error) throw error
      invoiceData = data
    } else {
      const { data, error } = await supabaseClient
        .from('e_archive_invoices')
        .select('*, companies!inner(id, name)')
        .eq('id', invoiceId)
        .single()
      
      if (error) throw error
      invoiceData = data
    }

    // Get Uyumsoft credentials for the company
    const { data: uyumsoftAccount, error: credError } = await supabaseClient
      .from('uyumsoft_accounts')
      .select('username, password_encrypted, company_code, test_mode')
      .eq('company_id', invoiceData.company_id)
      .eq('is_active', true)
      .single()

    if (credError || !uyumsoftAccount) {
      throw new Error('Uyumsoft hesap bilgileri bulunamadı')
    }

    // Uyumsoft API entegrasyonu için gerekli veriler
    const uyumsoftData = {
      username: uyumsoftAccount.username,
      password: uyumsoftAccount.password_encrypted, // Bu decrypt edilmeli
      companyCode: uyumsoftAccount.company_code,
      testMode: uyumsoftAccount.test_mode,
      invoice: invoiceData
    }

    // Uyumsoft API'ye gönderim (gerçek entegrasyon)
    console.log('Uyumsoft\'a gönderilecek veri:', uyumsoftData)

    // Şimdilik mock response - gerçek entegrasyon yapılacak
    const uyumsoftResponse = {
      success: true,
      invoiceId: invoiceData.id,
      uyumsoftId: `UYM-${Date.now()}`,
      status: 'sent',
      message: 'Fatura Uyumsoft üzerinden başarıyla gönderildi',
      sendDate: new Date().toISOString()
    }

    // Update invoice status with Uyumsoft response
    const tableName = invoiceType === 'e-invoice' ? 'e_invoices' : 'e_archive_invoices'
    
    const updateData = {
      gib_status: 'sent',
      gib_response: JSON.stringify(uyumsoftResponse),
      updated_at: new Date().toISOString()
    }

    const { error: updateError } = await supabaseClient
      .from(tableName)
      .update(updateData)
      .eq('id', invoiceId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ success: true, data: uyumsoftResponse }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error sending invoice to Uyumsoft:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
