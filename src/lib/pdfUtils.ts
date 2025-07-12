
import jsPDF from 'jspdf';

interface TahsilatMakbuzuData {
  makbuzNo: string;
  tarih: string;
  musteriAdi: string;
  odemeShekli: string;
  aciklama: string;
  tutar: number;
  tutarYazisi: string;
  tahsilEden: string;
}

export const generateTahsilatMakbuzu = (data: TahsilatMakbuzuData) => {
  const pdf = new jsPDF();
  
  // Font ayarları
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  
  // Başlık
  pdf.text('TAHSİLAT MAKBUZU', 105, 30, { align: 'center' });
  
  // Çizgi
  pdf.setLineWidth(0.5);
  pdf.line(20, 35, 190, 35);
  
  // Tablo başlıkları ve içerik
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  
  // Üst tablo
  const startY = 50;
  const lineHeight = 10;
  
  // Tablo çerçeveleri
  pdf.rect(20, startY, 170, lineHeight * 4);
  pdf.line(20, startY + lineHeight, 190, startY + lineHeight);
  pdf.line(20, startY + lineHeight * 2, 190, startY + lineHeight * 2);
  pdf.line(20, startY + lineHeight * 3, 190, startY + lineHeight * 3);
  pdf.line(100, startY, 100, startY + lineHeight * 4);
  
  // İçerik
  pdf.text('Makbuz No:', 22, startY + 7);
  pdf.text(data.makbuzNo, 102, startY + 7);
  
  pdf.text('Tarih:', 22, startY + 17);
  pdf.text(data.tarih, 102, startY + 17);
  
  pdf.text('Müşteri Adı:', 22, startY + 27);
  pdf.text(data.musteriAdi, 102, startY + 27);
  
  pdf.text('Ödeme Şekli:', 22, startY + 37);
  pdf.text(data.odemeShekli, 102, startY + 37);
  
  pdf.text('Açıklama:', 22, startY + 47);
  pdf.text(data.aciklama, 102, startY + 47);
  
  // Açıklama metni
  const aciklamaY = startY + 70;
  pdf.text(`Aşağıda bilgileri yer alan tutar, [${data.musteriAdi}] tarafından [${data.tahsilEden}]'dan`, 20, aciklamaY);
  pdf.text(`₺[${data.tutar.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}] olarak [${data.tarih}] tarihinde [${data.odemeShekli}] ile tahsil edilmiştir.`, 20, aciklamaY + 10);
  
  // Alt tablo
  const bottomTableY = aciklamaY + 40;
  pdf.rect(20, bottomTableY, 170, lineHeight * 2);
  pdf.line(20, bottomTableY + lineHeight, 190, bottomTableY + lineHeight);
  pdf.line(100, bottomTableY, 100, bottomTableY + lineHeight * 2);
  
  pdf.text('Tutar:', 22, bottomTableY + 7);
  pdf.text(`₺[${data.tutar.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}]`, 102, bottomTableY + 7);
  
  pdf.text('Yalnız:', 22, bottomTableY + 17);
  pdf.text(`[${data.tutarYazisi}] Türk Lirası`, 102, bottomTableY + 17);
  
  // Tahsil Eden
  const tahsilEdenY = bottomTableY + 40;
  pdf.text('Tahsil Eden:', 20, tahsilEdenY);
  pdf.text(`Ad Soyad: [${data.tahsilEden}]`, 20, tahsilEdenY + 20);
  
  return pdf;
};

export const numberToWords = (num: number): string => {
  const ones = ['', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'];
  const tens = ['', '', 'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan'];
  const teens = ['on', 'on bir', 'on iki', 'on üç', 'on dört', 'on beş', 'on altı', 'on yedi', 'on sekiz', 'on dokuz'];
  const hundreds = ['', 'yüz', 'iki yüz', 'üç yüz', 'dört yüz', 'beş yüz', 'altı yüz', 'yedi yüz', 'sekiz yüz', 'dokuz yüz'];
  
  if (num === 0) return 'sıfır';
  
  let intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);
  
  let result = '';
  
  if (intPart >= 1000000) {
    const millions = Math.floor(intPart / 1000000);
    result += numberToWords(millions) + ' milyon ';
    intPart %= 1000000;
  }
  
  if (intPart >= 1000) {
    const thousands = Math.floor(intPart / 1000);
    if (thousands === 1) {
      result += 'bin ';
    } else {
      result += numberToWords(thousands) + ' bin ';
    }
    intPart %= 1000;
  }
  
  if (intPart >= 100) {
    result += hundreds[Math.floor(intPart / 100)] + ' ';
    intPart %= 100;
  }
  
  if (intPart >= 20) {
    result += tens[Math.floor(intPart / 10)] + ' ';
    intPart %= 10;
  } else if (intPart >= 10) {
    result += teens[intPart - 10] + ' ';
    intPart = 0;
  }
  
  if (intPart > 0) {
    result += ones[intPart] + ' ';
  }
  
  if (decPart > 0) {
    result = result.trim() + ' virgül ';
    let decPartCopy = decPart;
    if (decPartCopy >= 20) {
      result += tens[Math.floor(decPartCopy / 10)] + ' ';
      decPartCopy %= 10;
    } else if (decPartCopy >= 10) {
      result += teens[decPartCopy - 10] + ' ';
      decPartCopy = 0;
    }
    if (decPartCopy > 0) {
      result += ones[decPartCopy] + ' ';
    }
  }
  
  return result.trim();
};
