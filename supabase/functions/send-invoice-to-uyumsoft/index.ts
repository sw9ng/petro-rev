
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
      .select('username, password_encrypted, test_mode')
      .eq('company_id', invoiceData.company_id)
      .eq('is_active', true)
      .single()

    if (credError || !uyumsoftAccount) {
      throw new Error('Uyumsoft hesap bilgileri bulunamadı')
    }

    // Prepare Uyumsoft API request
    const apiBaseUrl = uyumsoftAccount.test_mode ? UYUMSOFT_API_TEST : UYUMSOFT_API_LIVE
    
    // Create invoice payload for Uyumsoft API
    const invoicePayload = {
      username: uyumsoftAccount.username,
      password: uyumsoftAccount.password_encrypted,
      invoice: {
        invoiceNumber: invoiceData.invoice_number,
        invoiceDate: invoiceData.invoice_date,
        invoiceType: invoiceType === 'e-invoice' ? 'SATIS' : 'ARSIV',
        currencyCode: invoiceData.currency_code || 'TRY',
        customer: {
          name: invoiceData.customer_name || invoiceData.recipient_title,
          taxNumber: invoiceData.customer_tax_number || invoiceData.recipient_tax_number,
          tcNumber: invoiceData.customer_tc_number,
          address: invoiceData.customer_address || invoiceData.recipient_address
        },
        amounts: {
          totalAmount: parseFloat(invoiceData.total_amount || invoiceData.grand_total),
          taxAmount: parseFloat(invoiceData.tax_amount || 0),
          grandTotal: parseFloat(invoiceData.grand_total)
        }
      }
    }

    // Send to Uyumsoft API
    const uyumsoftEndpoint = invoiceType === 'e-invoice' 
      ? `${apiBaseUrl}/einvoice/send` 
      : `${apiBaseUrl}/earchive/send`

    console.log('Sending to Uyumsoft:', uyumsoftEndpoint)
    console.log('Payload:', JSON.stringify(invoicePayload, null, 2))

    const uyumsoftResponse = await fetch(uyumsoftEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(invoicePayload)
    })

    let uyumsoftResult
    try {
      uyumsoftResult = await uyumsoftResponse.json()
    } catch (error) {
      console.error('Failed to parse Uyumsoft response:', error)
      uyumsoftResult = { 
        success: false, 
        message: 'Invalid response from Uyumsoft',
        statusCode: uyumsoftResponse.status 
      }
    }

    console.log('Uyumsoft response:', uyumsoftResult)

    let updateData
    if (uyumsoftResponse.ok && uyumsoftResult.success) {
      updateData = {
        gib_status: 'sent',
        gib_response: JSON.stringify(uyumsoftResult),
        updated_at: new Date().toISOString()
      }
    } else {
      updateData = {
        gib_status: 'error',
        gib_response: JSON.stringify(uyumsoftResult),
        updated_at: new Date().toISOString()
      }
    }

    // Update invoice status with Uyumsoft response
    const tableName = invoiceType === 'e-invoice' ? 'e_invoices' : 'e_archive_invoices'
    
    const { error: updateError } = await supabaseClient
      .from(tableName)
      .update(updateData)
      .eq('id', invoiceId)

    if (updateError) throw updateError

    if (!uyumsoftResponse.ok || !uyumsoftResult.success) {
      throw new Error(uyumsoftResult.message || 'Uyumsoft gönderim hatası')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: uyumsoftResult,
        message: 'Fatura Uyumsoft üzerinden başarıyla gönderildi'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error sending invoice to Uyumsoft:', error)
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
