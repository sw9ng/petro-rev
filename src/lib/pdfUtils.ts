
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

// Türkçe karakterleri düzelt
const fixTurkishChars = (text: string): string => {
  return text
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
    .replace(/ü/g, 'u').replace(/Ü/g, 'U')
    .replace(/ş/g, 's').replace(/Ş/g, 'S')
    .replace(/ı/g, 'i').replace(/İ/g, 'I')
    .replace(/ö/g, 'o').replace(/Ö/g, 'O')
    .replace(/ç/g, 'c').replace(/Ç/g, 'C');
};

export const generateTahsilatMakbuzu = (data: TahsilatMakbuzuData) => {
  const pdf = new jsPDF();
  
  // Font ayarları
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  
  // Başlık - ortalanmış
  const pageWidth = pdf.internal.pageSize.getWidth();
  pdf.text('TAHSILAT MAKBUZU', pageWidth / 2, 30, { align: 'center' });
  
  // Çizgi
  pdf.setLineWidth(0.5);
  pdf.line(20, 35, 190, 35);
  
  // Tablo başlıkları ve içerik
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  
  // Üst tablo - 5 satır için
  const startY = 50;
  const lineHeight = 10;
  
  // Tablo çerçeveleri
  pdf.rect(20, startY, 170, lineHeight * 5);
  pdf.line(20, startY + lineHeight, 190, startY + lineHeight);
  pdf.line(20, startY + lineHeight * 2, 190, startY + lineHeight * 2);
  pdf.line(20, startY + lineHeight * 3, 190, startY + lineHeight * 3);
  pdf.line(20, startY + lineHeight * 4, 190, startY + lineHeight * 4);
  pdf.line(100, startY, 100, startY + lineHeight * 5);
  
  // İçerik - Türkçe karakterler düzeltilmiş
  pdf.text('Makbuz No:', 22, startY + 7);
  pdf.text(fixTurkishChars(data.makbuzNo), 102, startY + 7);
  
  pdf.text('Tarih:', 22, startY + 17);
  pdf.text(fixTurkishChars(data.tarih), 102, startY + 17);
  
  pdf.text('Musteri Adi:', 22, startY + 27);
  pdf.text(fixTurkishChars(data.musteriAdi), 102, startY + 27);
  
  pdf.text('Odeme Sekli:', 22, startY + 37);
  pdf.text(fixTurkishChars(data.odemeShekli), 102, startY + 37);
  
  pdf.text('Aciklama:', 22, startY + 47);
  pdf.text(fixTurkishChars(data.aciklama), 102, startY + 47);
  
  // Açıklama metni - Türkçe karakterler düzeltilmiş
  const aciklamaY = startY + 70;
  pdf.text(fixTurkishChars(`Asagida bilgileri yer alan tutar, [${data.musteriAdi}] tarafindan [${data.tahsilEden}]'dan`), 20, aciklamaY);
  pdf.text(fixTurkishChars(`TL[${data.tutar.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}] olarak [${data.tarih}] tarihinde [${data.odemeShekli}] ile tahsil edilmistir.`), 20, aciklamaY + 10);
  
  // Alt tablo
  const bottomTableY = aciklamaY + 40;
  pdf.rect(20, bottomTableY, 170, lineHeight * 2);
  pdf.line(20, bottomTableY + lineHeight, 190, bottomTableY + lineHeight);
  pdf.line(100, bottomTableY, 100, bottomTableY + lineHeight * 2);
  
  pdf.text('Tutar:', 22, bottomTableY + 7);
  pdf.text(`TL[${data.tutar.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}]`, 102, bottomTableY + 7);
  
  pdf.text('Yalniz:', 22, bottomTableY + 17);
  pdf.text(fixTurkishChars(`[${data.tutarYazisi}] Turk Lirasi`), 102, bottomTableY + 17);
  
  // Tahsil Eden
  const tahsilEdenY = bottomTableY + 40;
  pdf.text('Tahsil Eden:', 20, tahsilEdenY);
  pdf.text(fixTurkishChars(`Ad Soyad: [${data.tahsilEden}]`), 20, tahsilEdenY + 20);
  
  return pdf;
};

export const numberToWords = (num: number): string => {
  const ones = ['', 'bir', 'iki', 'uc', 'dort', 'bes', 'alti', 'yedi', 'sekiz', 'dokuz'];
  const tens = ['', '', 'yirmi', 'otuz', 'kirk', 'elli', 'altmis', 'yetmis', 'seksen', 'doksan'];
  const teens = ['on', 'on bir', 'on iki', 'on uc', 'on dort', 'on bes', 'on alti', 'on yedi', 'on sekiz', 'on dokuz'];
  const hundreds = ['', 'yuz', 'iki yuz', 'uc yuz', 'dort yuz', 'bes yuz', 'alti yuz', 'yedi yuz', 'sekiz yuz', 'dokuz yuz'];
  
  if (num === 0) return 'sifir';
  
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
    result = result.trim() + ' virgul ';
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
