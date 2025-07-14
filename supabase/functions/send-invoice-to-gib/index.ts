
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
        .select('*')
        .eq('id', invoiceId)
        .single()
      
      if (error) throw error
      invoiceData = data
    } else {
      const { data, error } = await supabaseClient
        .from('e_archive_invoices')
        .select('*')
        .eq('id', invoiceId)
        .single()
      
      if (error) throw error
      invoiceData = data
    }

    // Bu kısımda mlevent/fatura kütüphanesini kullanacağız
    // Şimdilik mock response döndürüyoruz
    const gibResponse = {
      success: true,
      ettn: invoiceData.ettn || `ETTN-${Date.now()}`,
      uuid: invoiceData.invoice_uuid || crypto.randomUUID(),
      status: 'sent',
      message: 'Fatura GİB\'e başarıyla gönderildi'
    }

    // Update invoice status
    const tableName = invoiceType === 'e-invoice' ? 'e_invoices' : 'e_archive_invoices'
    
    const { error: updateError } = await supabaseClient
      .from(tableName)
      .update({
        gib_status: 'sent',
        gib_response: JSON.stringify(gibResponse),
        ...(invoiceType === 'e-invoice' && { ettn: gibResponse.ettn, invoice_uuid: gibResponse.uuid })
      })
      .eq('id', invoiceId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ success: true, data: gibResponse }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error sending invoice to GIB:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
