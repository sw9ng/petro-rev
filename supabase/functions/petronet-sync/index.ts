
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PetronetSyncRequest {
  user_id: string;
  email: string;
  password: string;
}

interface PetronetFile {
  name: string;
  content: string;
  hash: string;
  size: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { user_id, email, password }: PetronetSyncRequest = await req.json();

    console.log(`Petronet sync started for user: ${user_id}`);

    // Simulate Petronet login and file fetching
    // Bu kısım gerçek Petronet API'si ile değiştirilecek
    const files = await fetchPetronetFiles(email, password);
    
    let processedFiles = 0;
    let newFiles = 0;

    for (const file of files) {
      // Check if file already exists
      const { data: existingFile } = await supabase
        .from('petronet_files')
        .select('id')
        .eq('user_id', user_id)
        .eq('file_hash', file.hash)
        .single();

      if (existingFile) {
        console.log(`File already exists: ${file.name}`);
        continue;
      }

      // Upload file to Supabase Storage
      const filePath = `${user_id}/${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('petronet-files')
        .upload(filePath, file.content, {
          contentType: 'text/plain',
          upsert: false
        });

      if (uploadError) {
        console.error(`Upload error for ${file.name}:`, uploadError);
        continue;
      }

      // Save file metadata
      const { error: metadataError } = await supabase
        .from('petronet_files')
        .insert({
          user_id,
          file_name: file.name,
          file_hash: file.hash,
          file_size: file.size,
          file_path: filePath,
          processed: false
        });

      if (metadataError) {
        console.error(`Metadata error for ${file.name}:`, metadataError);
        continue;
      }

      // Process the file content and extract shift data
      await processShiftFile(supabase, user_id, file, filePath);
      
      newFiles++;
      processedFiles++;
    }

    // Update last sync time
    await supabase
      .from('profiles')
      .update({ last_sync_time: new Date().toISOString() })
      .eq('id', user_id);

    console.log(`Petronet sync completed for user ${user_id}. Processed: ${processedFiles}, New: ${newFiles}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        files_processed: processedFiles,
        new_files: newFiles,
        message: `${newFiles} yeni dosya işlendi`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Petronet sync error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function fetchPetronetFiles(email: string, password: string): Promise<PetronetFile[]> {
  // Bu fonksiyon gerçek Petronet sistemi ile entegre edilecek
  // Şimdilik örnek veri döndürüyoruz
  
  console.log(`Fetching files from Petronet for: ${email}`);
  
  // Simulate HTTP requests to Petronet
  // 1. Login request
  // 2. Get file list
  // 3. Download each file
  
  // Örnek dosya verisi
  const sampleFiles: PetronetFile[] = [
    {
      name: `vardiya_${new Date().toISOString().split('T')[0]}.txt`,
      content: `VARDIYA RAPORU
Tarih: ${new Date().toLocaleDateString('tr-TR')}
V1 Vardiyası
Nakit Satış: 1500.00
Kart Satış: 2500.00
Otomasyon: 4000.00
`,
      hash: crypto.randomUUID(),
      size: 150
    }
  ];
  
  return sampleFiles;
}

async function processShiftFile(supabase: any, userId: string, file: PetronetFile, filePath: string) {
  try {
    console.log(`Processing shift file: ${file.name}`);
    
    // Parse file content and extract shift data
    const shiftData = parseShiftData(file.content);
    
    if (shiftData) {
      // Import shift data to shifts table
      const { error } = await supabase
        .from('shifts')
        .insert({
          station_id: userId,
          personnel_id: shiftData.personnel_id || null,
          start_time: shiftData.start_time,
          end_time: shiftData.end_time,
          expected_amount: shiftData.expected_amount || 0,
          cash_sales: shiftData.cash_sales || 0,
          card_sales: shiftData.card_sales || 0,
          bank_transfers: shiftData.bank_transfers || 0,
          shift_number: shiftData.shift_number || 'V1',
          status: 'active'
        });

      if (error) {
        console.error('Shift data import error:', error);
      } else {
        console.log('Shift data imported successfully');
      }
    }

    // Mark file as processed
    await supabase
      .from('petronet_files')
      .update({ processed: true })
      .eq('file_path', filePath);

  } catch (error) {
    console.error('File processing error:', error);
  }
}

function parseShiftData(content: string) {
  // Bu fonksiyon Petronet dosya formatına göre özelleştirilecek
  // Şimdilik basit bir parsing örneği
  
  const lines = content.split('\n');
  const shiftData: any = {
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 saat sonra
    shift_number: 'V1'
  };
  
  for (const line of lines) {
    if (line.includes('Nakit Satış:')) {
      shiftData.cash_sales = parseFloat(line.split(':')[1]?.trim() || '0');
    } else if (line.includes('Kart Satış:')) {
      shiftData.card_sales = parseFloat(line.split(':')[1]?.trim() || '0');
    } else if (line.includes('Otomasyon:')) {
      shiftData.expected_amount = parseFloat(line.split(':')[1]?.trim() || '0');
    }
  }
  
  return shiftData;
}
