
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UyumsoftTestCredentials {
  username: string;
  password: string;
  integrationUrl: string;
  bulkUploadUrl: string;
}

const uyumsoftTest: UyumsoftTestCredentials = {
  username: 'Uyumsoft',
  password: 'Uyumsoft',
  integrationUrl: 'https://efatura-test.uyumsoft.com.tr/Services/Integration',
  bulkUploadUrl: 'https://portal-test.uyumsoft.com.tr/Fatura/TopluXml'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { xmlData, action = 'send' } = await req.json()
    console.log('Uyumsoft API request:', { action, xmlLength: xmlData?.length });

    if (!xmlData) {
      throw new Error('XML data is required')
    }

    if (action === 'send') {
      // Send XML to Uyumsoft Integration API
      const response = await fetch(uyumsoftTest.integrationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          'Authorization': `Basic ${btoa(`${uyumsoftTest.username}:${uyumsoftTest.password}`)}`
        },
        body: xmlData
      })

      console.log('Uyumsoft API response status:', response.status);
      
      const responseText = await response.text()
      console.log('Uyumsoft API response:', responseText);

      if (!response.ok) {
        throw new Error(`Uyumsoft API error: ${response.status} - ${responseText}`)
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'e-Fatura başarıyla Uyumsoft test portalına gönderildi',
          status: response.status,
          response: responseText
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (action === 'bulk-upload') {
      // Create FormData for bulk upload
      const formData = new FormData()
      const xmlBlob = new Blob([xmlData], { type: 'application/xml' })
      formData.append('file', xmlBlob, 'efatura.xml')

      const response = await fetch(uyumsoftTest.bulkUploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${uyumsoftTest.username}:${uyumsoftTest.password}`)}`
        },
        body: formData
      })

      console.log('Bulk upload response status:', response.status);
      
      const responseText = await response.text()
      console.log('Bulk upload response:', responseText);

      if (!response.ok) {
        throw new Error(`Bulk upload error: ${response.status} - ${responseText}`)
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'XML toplu yükleme başarılı',
          status: response.status,
          response: responseText
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    throw new Error('Invalid action: ' + action)

  } catch (error) {
    console.error('Uyumsoft integration error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Uyumsoft entegrasyonunda hata oluştu'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
