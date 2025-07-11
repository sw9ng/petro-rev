
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UyumsoftConfig {
  baseUrl: string;
  username: string;
  password: string;
}

// Mock Uyumsoft API configuration - replace with real credentials
const uyumsoftConfig: UyumsoftConfig = {
  baseUrl: 'https://api.uyumsoft.com/test', // Test API URL
  username: Deno.env.get('UYUMSOFT_USERNAME') || 'test_user',
  password: Deno.env.get('UYUMSOFT_PASSWORD') || 'test_password'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { invoiceId, invoiceType, action } = await req.json()

    if (!invoiceId || !invoiceType || !action) {
      throw new Error('Missing required parameters')
    }

    console.log(`Processing ${action} for ${invoiceType} invoice:`, invoiceId)

    // Get invoice data from database
    const tableName = invoiceType === 'income' ? 'income_invoices' : 'expense_invoices'
    const { data: invoice, error: fetchError } = await supabaseClient
      .from(tableName)
      .select('*')
      .eq('id', invoiceId)
      .single()

    if (fetchError || !invoice) {
      throw new Error('Invoice not found')
    }

    if (action === 'send') {
      // Send invoice to Uyumsoft
      const uyumsoftResponse = await sendToUyumsoft(invoice, invoiceType)
      
      // Update invoice with Uyumsoft response
      const { error: updateError } = await supabaseClient
        .from(tableName)
        .update({
          e_invoice_status: 'sent',
          uyumsoft_id: uyumsoftResponse.invoiceId,
          e_invoice_number: uyumsoftResponse.eInvoiceNumber,
          send_date: new Date().toISOString()
        })
        .eq('id', invoiceId)

      if (updateError) {
        throw updateError
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Invoice sent to Uyumsoft successfully',
          uyumsoftId: uyumsoftResponse.invoiceId
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (action === 'send-to-gib') {
      // Send invoice to GIB via Uyumsoft
      const gibResponse = await sendToGIB(invoice.uyumsoft_id)
      
      // Update invoice with GIB response
      const { error: updateError } = await supabaseClient
        .from(tableName)
        .update({
          gib_status: gibResponse.success ? 'success' : 'failed'
        })
        .eq('id', invoiceId)

      if (updateError) {
        throw updateError
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: gibResponse.success ? 'Invoice sent to GIB successfully' : 'Failed to send to GIB'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    throw new Error('Invalid action')

  } catch (error) {
    console.error('E-invoice processing error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred' 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function sendToUyumsoft(invoice: any, invoiceType: string) {
  console.log('Sending to Uyumsoft:', { invoice, invoiceType })
  
  // Mock Uyumsoft API call - replace with real implementation
  // This would be the actual API call to Uyumsoft
  const mockResponse = {
    success: true,
    invoiceId: `UYU-${Date.now()}`,
    eInvoiceNumber: `E-${Date.now()}`,
    message: 'Invoice created successfully in Uyumsoft'
  }

  // Simulated API delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // In real implementation, you would make actual HTTP request to Uyumsoft API:
  /*
  const response = await fetch(`${uyumsoftConfig.baseUrl}/invoice/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(uyumsoftConfig.username + ':' + uyumsoftConfig.password)}`
    },
    body: JSON.stringify({
      invoiceType: invoiceType,
      invoiceNumber: invoice.invoice_number,
      description: invoice.description,
      amount: invoice.amount,
      invoiceDate: invoice.invoice_date,
      taxNumber: invoice.tax_number,
      companyTitle: invoice.company_title
    })
  })

  if (!response.ok) {
    throw new Error('Failed to send invoice to Uyumsoft')
  }

  const result = await response.json()
  */

  return mockResponse
}

async function sendToGIB(uyumsoftId: string) {
  console.log('Sending to GIB via Uyumsoft:', uyumsoftId)
  
  // Mock GIB sending - replace with real implementation
  const mockResponse = {
    success: Math.random() > 0.2, // 80% success rate for testing
    message: 'Invoice sent to GIB'
  }

  // Simulated API delay
  await new Promise(resolve => setTimeout(resolve, 1500))

  // In real implementation:
  /*
  const response = await fetch(`${uyumsoftConfig.baseUrl}/invoice/send-to-gib`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(uyumsoftConfig.username + ':' + uyumsoftConfig.password)}`
    },
    body: JSON.stringify({
      uyumsoftInvoiceId: uyumsoftId
    })
  })

  const result = await response.json()
  */

  return mockResponse
}
