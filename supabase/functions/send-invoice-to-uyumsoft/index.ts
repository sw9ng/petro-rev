
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

// Uyumsoft SOAP API endpoints based on WSDL
const UYUMSOFT_SOAP_TEST = 'https://efatura-test.uyumsoft.com.tr/Services/Integration'
const UYUMSOFT_SOAP_LIVE = 'https://edonusumapi.uyum.com.tr/Services/Integration'

// SOAP envelope template for Uyumsoft integration
const createSOAPEnvelope = (action: string, body: string, username: string, password: string) => {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soap:Header>
    <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
      <wsse:UsernameToken>
        <wsse:Username>${username}</wsse:Username>
        <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">${password}</wsse:Password>
      </wsse:UsernameToken>
    </wsse:Security>
  </soap:Header>
  <soap:Body>
    <tem:${action}>
      ${body}
    </tem:${action}>
  </soap:Body>
</soap:Envelope>`;
}

// Fatura veri yapıları
interface UyumsoftInvoiceEntity {
  Id?: {
    SchemeID: string
    Value: string
  }
  IssueDate?: string
  IssueTime?: string
  InvoiceTypeCode?: {
    listID: string
    listAgencyID: string
    listVersionID: string
    Value: string
  }
  Note?: string[]
  DocumentCurrencyCode?: {
    listID: string
    listAgencyID: string
    listVersionID: string
    Value: string
  }
  LineCountNumeric?: {
    Value: number
  }
  AccountingSupplierParty?: any
  AccountingCustomerParty?: any
  TaxTotal?: any
  LegalMonetaryTotal?: any
  InvoiceLine?: any[]
}

// Yardımcı fonksiyonlar
function priceToText(number: number): string {
  const units = ["", "Bir", "İki", "Üç", "Dört", "Beş", "Altı", "Yedi", "Sekiz", "Dokuz"];
  const tens = ["", "On", "Yirmi", "Otuz", "Kırk", "Elli", "Altmış", "Yetmiş", "Seksen", "Doksan"];
  const thousands = ["", "Bin", "Milyon", "Milyar", "Trilyon", "Katrilyon"];

  if (number === 0) {
    return "Sıfır Türk Lirası";
  }

  const numberStr = number.toFixed(2);
  const [integerPart, fractionalPart] = numberStr.split('.');
  
  let words = "";
  const integerPartLength = integerPart.length;
  let groupCount = 0;

  for (let i = 0; i < integerPartLength; i += 3) {
    const digitValues = [0, 0, 0];

    for (let j = 0; j < 3; j++) {
      if (i + j < integerPartLength) {
        digitValues[j] = parseInt(integerPart[integerPartLength - i - j - 1]);
      }
    }

    let groupWords = "";

    if (digitValues[2] > 0) {
      if (digitValues[2] === 1) {
        groupWords += "Yüz";
      } else {
        groupWords += units[digitValues[2]] + " Yüz";
      }
    }

    if (digitValues[1] > 0) {
      groupWords += " " + tens[digitValues[1]];
    }

    if (digitValues[0] > 0) {
      groupWords += " " + units[digitValues[0]];
    }

    groupWords = groupWords.trim();

    if (groupWords !== "") {
      if (groupCount > 0) {
        if (groupCount === 1 && digitValues[2] === 0 && digitValues[1] === 0 && digitValues[0] === 1) {
          groupWords = "";
        }
        groupWords += " " + thousands[groupCount];
      }

      words = groupWords + " " + words;
    }

    groupCount++;
  }

  words = words.trim();

  if (words === "") {
    words = "Sıfır";
  }

  words += " Türk Lirası";

  const fractionalValue = parseInt(fractionalPart);
  if (fractionalValue > 0) {
    words += " " + fractionalValue + " Kuruş";
  }

  return words;
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

    // Get invoice data with company info
    let invoiceData, companyData
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

    // Get company data
    const { data: company, error: companyError } = await supabaseClient
      .from('companies')
      .select('*')
      .eq('id', invoiceData.company_id)
      .single()

    if (companyError || !company) {
      throw new Error('Şirket bilgileri bulunamadı')
    }
    companyData = company

    // Get Uyumsoft credentials
    const { data: uyumsoftAccount, error: credError } = await supabaseClient
      .from('uyumsoft_accounts')
      .select('username, password_encrypted, test_mode')
      .eq('company_id', invoiceData.company_id)
      .eq('is_active', true)
      .single()

    if (credError || !uyumsoftAccount) {
      throw new Error('Uyumsoft hesap bilgileri bulunamadı')
    }

    console.log('Building Uyumsoft invoice entity...')

    // Build complete Uyumsoft invoice entity
    const invoiceEntity: UyumsoftInvoiceEntity = {
      Id: {
        SchemeID: "UUID",
        Value: invoiceData.id
      },
      IssueDate: new Date(invoiceData.invoice_date).toISOString().split('T')[0],
      IssueTime: new Date().toTimeString().split(' ')[0],
      InvoiceTypeCode: {
        listID: "UN/ECE 1001 Subset",
        listAgencyID: "6",
        listVersionID: "1.0",
        Value: invoiceType === 'e-invoice' ? "SATIS" : "ARSIV"
      },
      Note: [
        "Fatura Notu",
        `#${priceToText(parseFloat(invoiceData.grand_total || invoiceData.total_amount))}#`
      ],
      DocumentCurrencyCode: {
        listID: "ISO 4217 Alpha",
        listAgencyID: "5",
        listVersionID: "2008",
        Value: invoiceData.currency_code || "TRY"
      },
      LineCountNumeric: {
        Value: 1
      },
      
      // Supplier (Company) Party
      AccountingSupplierParty: {
        Party: {
          PartyIdentification: [
            {
              ID: {
                SchemeID: companyData.tax_number ? "VKN" : "TCKN",
                Value: companyData.tax_number || companyData.tc_number || "1111111111"
              }
            }
          ],
          PartyName: {
            Name: companyData.name
          },
          PostalAddress: {
            StreetName: companyData.address || "",
            CitySubdivisionName: companyData.district || "",
            CityName: companyData.city || "",
            Country: {
              Name: "Türkiye"
            }
          },
          PartyTaxScheme: {
            TaxScheme: {
              Name: companyData.tax_office || ""
            }
          },
          Person: {
            FirstName: companyData.authorized_person_name || "",
            FamilyName: companyData.authorized_person_surname || ""
          }
        }
      },

      // Customer Party
      AccountingCustomerParty: {
        Party: {
          PartyIdentification: [
            {
              ID: {
                SchemeID: invoiceData.recipient_tax_number ? "VKN" : "TCKN",
                Value: invoiceData.recipient_tax_number || invoiceData.recipient_tc_number || "11111111111"
              }
            }
          ],
          PartyName: {
            Name: invoiceData.recipient_title || invoiceData.customer_name
          },
          PostalAddress: {
            StreetName: invoiceData.recipient_address || "",
            CitySubdivisionName: "",
            CityName: "",
            Country: {
              Name: "Türkiye"
            }
          },
          PartyTaxScheme: {
            TaxScheme: {
              Name: ""
            }
          },
          Person: {
            FirstName: "",
            FamilyName: ""
          }
        }
      },

      // Tax Total
      TaxTotal: {
        TaxAmount: {
          currencyID: invoiceData.currency_code || "TRY",
          Value: parseFloat(invoiceData.tax_amount || "0")
        },
        TaxSubtotal: [
          {
            TaxableAmount: {
              currencyID: invoiceData.currency_code || "TRY",
              Value: parseFloat(invoiceData.total_amount || invoiceData.subtotal || "0")
            },
            TaxAmount: {
              currencyID: invoiceData.currency_code || "TRY",
              Value: parseFloat(invoiceData.tax_amount || "0")
            },
            Percent: {
              Value: 18
            },
            TaxCategory: {
              TaxScheme: {
                Name: "KDV",
                TaxTypeCode: "0015"
              }
            }
          }
        ]
      },

      // Legal Monetary Total
      LegalMonetaryTotal: {
        LineExtensionAmount: {
          currencyID: invoiceData.currency_code || "TRY",
          Value: parseFloat(invoiceData.total_amount || invoiceData.subtotal || "0")
        },
        TaxExclusiveAmount: {
          currencyID: invoiceData.currency_code || "TRY",
          Value: parseFloat(invoiceData.total_amount || invoiceData.subtotal || "0")
        },
        TaxInclusiveAmount: {
          currencyID: invoiceData.currency_code || "TRY",
          Value: parseFloat(invoiceData.grand_total || invoiceData.total_amount || "0")
        },
        AllowanceTotalAmount: {
          currencyID: invoiceData.currency_code || "TRY",
          Value: 0
        },
        PayableAmount: {
          currencyID: invoiceData.currency_code || "TRY",
          Value: parseFloat(invoiceData.grand_total || invoiceData.total_amount || "0")
        }
      },

      // Invoice Lines
      InvoiceLine: [
        {
          ID: {
            Value: "1"
          },
          InvoicedQuantity: {
            unitCode: "C62",
            Value: 1
          },
          LineExtensionAmount: {
            currencyID: invoiceData.currency_code || "TRY",
            Value: parseFloat(invoiceData.total_amount || invoiceData.subtotal || "0")
          },
          TaxTotal: {
            TaxAmount: {
              currencyID: invoiceData.currency_code || "TRY",
              Value: parseFloat(invoiceData.tax_amount || "0")
            },
            TaxSubtotal: [
              {
                TaxableAmount: {
                  currencyID: invoiceData.currency_code || "TRY",
                  Value: parseFloat(invoiceData.total_amount || invoiceData.subtotal || "0")
                },
                TaxAmount: {
                  currencyID: invoiceData.currency_code || "TRY",
                  Value: parseFloat(invoiceData.tax_amount || "0")
                },
                Percent: {
                  Value: 18
                },
                TaxCategory: {
                  TaxScheme: {
                    Name: "KDV",
                    TaxTypeCode: "0015"
                  }
                }
              }
            ]
          },
          Item: {
            Name: invoiceData.description || "Ürün/Hizmet"
          },
          Price: {
            PriceAmount: {
              currencyID: invoiceData.currency_code || "TRY",
              Value: parseFloat(invoiceData.total_amount || invoiceData.subtotal || "0")
            }
          }
        }
      ]
    }

    // Prepare final payload for Uyumsoft
    const uyumsoftPayload = {
      Action: "SendInvoice",
      parameters: {
        ...invoiceEntity,
        EArchiveInvoiceInfo: {
          DeliveryType: "Electronic"
        },
        Scenario: 0,
        Notification: {
          Mailing: [
            {
              Subject: `Fatura: ${invoiceData.invoice_number} numaralı faturanız.`,
              EnableNotification: true,
              To: invoiceData.recipient_email || "",
              Attachment: {
                Xml: true,
                Pdf: true
              }
            }
          ]
        },
        userInfo: {
          Username: uyumsoftAccount.username,
          Password: uyumsoftAccount.password_encrypted
        }
      }
    }

    // Determine SOAP API endpoint
    const apiBaseUrl = uyumsoftAccount.test_mode ? UYUMSOFT_SOAP_TEST : UYUMSOFT_SOAP_LIVE
    
    console.log('Sending to Uyumsoft SOAP API:', apiBaseUrl)
    console.log('Invoice details:', {
      invoiceId: invoiceEntity.Id?.Value,
      companyName: companyData.name,
      customerName: invoiceData.recipient_title,
      amount: uyumsoftPayload.parameters.LegalMonetaryTotal?.PayableAmount?.Value
    })

    // Create SOAP body for SendInvoice operation
    const soapBody = `
      <tem:invoiceEntity>
        <tem:InvoiceData>${JSON.stringify(invoiceEntity)}</tem:InvoiceData>
        <tem:EArchiveInvoiceInfo>
          <tem:DeliveryType>Electronic</tem:DeliveryType>
        </tem:EArchiveInvoiceInfo>
        <tem:Scenario>0</tem:Scenario>
        <tem:Notification>
          <tem:Mailing>
            <tem:Subject>Fatura: ${invoiceData.invoice_number} numaralı faturanız.</tem:Subject>
            <tem:EnableNotification>true</tem:EnableNotification>
            <tem:To>${invoiceData.recipient_email || ""}</tem:To>
            <tem:Attachment>
              <tem:Xml>true</tem:Xml>
              <tem:Pdf>true</tem:Pdf>
            </tem:Attachment>
          </tem:Mailing>
        </tem:Notification>
      </tem:invoiceEntity>
    `;

    // Create SOAP envelope
    const soapEnvelope = createSOAPEnvelope(
      'SendInvoice',
      soapBody,
      uyumsoftAccount.username,
      uyumsoftAccount.password_encrypted
    );

    console.log('SOAP envelope created for SendInvoice operation')

    // Send SOAP request to Uyumsoft API
    const uyumsoftResponse = await fetch(apiBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://tempuri.org/IIntegration/SendInvoice',
        'Accept': 'text/xml'
      },
      body: soapEnvelope
    })

    let uyumsoftResult
    try {
      const responseText = await uyumsoftResponse.text()
      console.log('SOAP Response received:', responseText.substring(0, 500) + '...')
      
      // Parse SOAP response
      if (responseText.includes('<soap:Fault>') || responseText.includes('soap:Fault')) {
        // SOAP fault occurred
        const faultMatch = responseText.match(/<faultstring[^>]*>(.*?)<\/faultstring>/i)
        const faultString = faultMatch ? faultMatch[1] : 'SOAP Fault occurred'
        uyumsoftResult = { 
          success: false, 
          message: `SOAP Fault: ${faultString}`,
          rawResponse: responseText,
          statusCode: uyumsoftResponse.status 
        }
      } else if (responseText.includes('SendInvoiceResponse')) {
        // Success response
        const resultMatch = responseText.match(/<SendInvoiceResult[^>]*>(.*?)<\/SendInvoiceResult>/is)
        const resultContent = resultMatch ? resultMatch[1] : responseText
        uyumsoftResult = { 
          success: true, 
          message: 'Fatura başarıyla gönderildi',
          data: resultContent,
          rawResponse: responseText 
        }
      } else {
        // Unknown response format
        uyumsoftResult = { 
          success: false, 
          message: 'Beklenmeyen yanıt formatı',
          rawResponse: responseText,
          statusCode: uyumsoftResponse.status 
        }
      }
    } catch (error) {
      console.error('Failed to parse Uyumsoft SOAP response:', error)
      uyumsoftResult = { 
        success: false, 
        message: 'Uyumsoft SOAP yanıtı işlenemedi',
        error: error.message,
        statusCode: uyumsoftResponse.status 
      }
    }

    console.log('Uyumsoft response:', uyumsoftResult)

    // Update invoice status
    let updateData
    if (uyumsoftResponse.ok && (uyumsoftResult.success !== false)) {
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

    const tableName = invoiceType === 'e-invoice' ? 'e_invoices' : 'e_archive_invoices'
    
    const { error: updateError } = await supabaseClient
      .from(tableName)
      .update(updateData)
      .eq('id', invoiceId)

    if (updateError) {
      console.error('Failed to update invoice:', updateError)
    }

    if (!uyumsoftResponse.ok || uyumsoftResult.success === false) {
      throw new Error(uyumsoftResult.message || uyumsoftResult.Message || 'Uyumsoft gönderim hatası')
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
