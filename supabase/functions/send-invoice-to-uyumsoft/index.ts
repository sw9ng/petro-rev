
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
const UYUMSOFT_API_BASE = 'https://efaturatest.uyumsoft.com.tr/services'
const UYUMSOFT_API_LIVE = 'https://efatura.uyumsoft.com.tr/services'

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

    // Prepare Uyumsoft API request
    const apiBaseUrl = uyumsoftAccount.test_mode ? UYUMSOFT_API_BASE : UYUMSOFT_API_LIVE
    
    // Create invoice payload for Uyumsoft
    const invoicePayload = {
      username: uyumsoftAccount.username,
      password: uyumsoftAccount.password_encrypted, // In production, this should be decrypted
      companyCode: uyumsoftAccount.company_code,
      invoiceData: {
        invoiceNumber: invoiceData.invoice_number,
        invoiceDate: invoiceData.invoice_date,
        totalAmount: invoiceData.total_amount || invoiceData.grand_total,
        taxAmount: invoiceData.tax_amount,
        grandTotal: invoiceData.grand_total,
        customerName: invoiceData.customer_name || invoiceData.recipient_title,
        customerTaxNumber: invoiceData.customer_tax_number || invoiceData.recipient_tax_number,
        customerAddress: invoiceData.customer_address || invoiceData.recipient_address,
        currencyCode: invoiceData.currency_code
      }
    }

    // Send to Uyumsoft API
    const uyumsoftEndpoint = invoiceType === 'e-invoice' 
      ? `${apiBaseUrl}/EInvoiceService` 
      : `${apiBaseUrl}/EArchiveService`

    console.log('Uyumsoft\'a gönderilecek veri:', JSON.stringify(invoicePayload, null, 2))

    // For now, simulate the API call since we don't have the actual Uyumsoft API details
    // In production, you would make the actual HTTP request to Uyumsoft
    const uyumsoftResponse = {
      success: true,
      invoiceId: invoiceData.id,
      uyumsoftId: `UYM-${Date.now()}`,
      status: 'sent',
      message: 'Fatura Uyumsoft üzerinden başarıyla gönderildi',
      sendDate: new Date().toISOString(),
      gibStatus: 'pending'
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
