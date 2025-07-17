
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

interface IslemGecmisiData {
  musteriAdi: string;
  baslangicTarihi?: string;
  bitisTarihi?: string;
  islemler: Array<{
    tarih: string;
    saat: string;
    personel: string;
    islemTuru: string;
    tutar: number;
    odemeYontemi?: string;
    aciklama?: string;
  }>;
  toplamBorc: number;
  toplamOdeme: number;
  bakiye: number;
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

export const generateIslemGecmisiRaporu = (data: IslemGecmisiData) => {
  const pdf = new jsPDF();
  let currentY = 30;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const leftMargin = 20;
  const rightMargin = 20;
  const lineHeight = 8;
  
  // Başlık
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text('ISLEM GECMISI RAPORU', pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 15;
  
  // Çizgi
  pdf.setLineWidth(0.5);
  pdf.line(leftMargin, currentY, pageWidth - rightMargin, currentY);
  currentY += 10;
  
  // Müşteri bilgileri
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text(fixTurkishChars(`Musteri: ${data.musteriAdi}`), leftMargin, currentY);
  currentY += 10;
  
  // Tarih aralığı
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  const tarihAraligi = `Tarih Araligi: ${data.baslangicTarihi || 'Baslangic'} - ${data.bitisTarihi || 'Bitis'}`;
  pdf.text(fixTurkishChars(tarihAraligi), leftMargin, currentY);
  currentY += 15;
  
  // Tablo başlıkları
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  const headers = ['Tarih', 'Saat', 'Personel', 'Islem Turu', 'Tutar', 'Odeme Yontemi', 'Aciklama'];
  const colWidths = [25, 15, 30, 25, 25, 25, 45];
  let xPos = leftMargin;
  
  // Başlık arka planı
  pdf.setFillColor(240, 240, 240);
  pdf.rect(leftMargin, currentY - 5, pageWidth - leftMargin - rightMargin, 10, 'F');
  
  headers.forEach((header, index) => {
    pdf.text(fixTurkishChars(header), xPos + 2, currentY);
    xPos += colWidths[index];
  });
  
  currentY += 10;
  
  // Tablo çizgileri
  pdf.setLineWidth(0.3);
  xPos = leftMargin;
  for (let i = 0; i <= headers.length; i++) {
    pdf.line(xPos, currentY - 10, xPos, currentY);
    if (i < headers.length) xPos += colWidths[i];
  }
  
  // İşlemler
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  
  data.islemler.forEach((islem, index) => {
    // Sayfa kontrolü
    if (currentY > pageHeight - 30) {
      pdf.addPage();
      currentY = 30;
    }
    
    xPos = leftMargin;
    
    // Satır arka planı (her ikinci satır)
    if (index % 2 === 1) {
      pdf.setFillColor(250, 250, 250);
      pdf.rect(leftMargin, currentY - 3, pageWidth - leftMargin - rightMargin, lineHeight, 'F');
    }
    
    // Satır verileri
    const rowData = [
      islem.tarih,
      islem.saat,
      islem.personel,
      islem.islemTuru,
      `${islem.islemTuru === 'Ödeme' ? '+' : '-'}${islem.tutar.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`,
      islem.odemeYontemi || '-',
      islem.aciklama || '-'
    ];
    
    rowData.forEach((data, colIndex) => {
      const text = fixTurkishChars(data.toString());
      // Metin uzunluğunu kontrol et ve kesilmesini engelle
      const maxWidth = colWidths[colIndex] - 4;
      const textWidth = pdf.getTextWidth(text);
      
      if (textWidth > maxWidth && colIndex === 6) { // Açıklama kolonu
        const words = text.split(' ');
        let line = '';
        let lines = [];
        
        words.forEach(word => {
          const testLine = line + (line ? ' ' : '') + word;
          if (pdf.getTextWidth(testLine) > maxWidth) {
            if (line) lines.push(line);
            line = word;
          } else {
            line = testLine;
          }
        });
        if (line) lines.push(line);
        
        lines.forEach((lineText, lineIndex) => {
          pdf.text(lineText, xPos + 2, currentY + (lineIndex * 4));
        });
        
        if (lines.length > 1) currentY += (lines.length - 1) * 4;
      } else {
        pdf.text(text, xPos + 2, currentY);
      }
      
      xPos += colWidths[colIndex];
    });
    
    currentY += lineHeight;
    
    // Satır çizgisi
    xPos = leftMargin;
    for (let i = 0; i <= headers.length; i++) {
      pdf.line(xPos, currentY, xPos, currentY - lineHeight);
      if (i < headers.length) xPos += colWidths[i];
    }
    pdf.line(leftMargin, currentY, pageWidth - rightMargin, currentY);
  });
  
  // Özet bilgileri
  currentY += 15;
  
  if (currentY > pageHeight - 50) {
    pdf.addPage();
    currentY = 30;
  }
  
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('OZET BILGILER', leftMargin, currentY);
  currentY += 10;
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.text(fixTurkishChars(`Toplam Borc: ${data.toplamBorc.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`), leftMargin, currentY);
  currentY += 8;
  pdf.text(fixTurkishChars(`Toplam Odeme: ${data.toplamOdeme.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`), leftMargin, currentY);
  currentY += 8;
  
  const bakiyeText = data.bakiye > 0 
    ? `Kalan Borc: ${data.bakiye.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`
    : data.bakiye < 0 
    ? `Fazla Odeme: ${Math.abs(data.bakiye).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`
    : 'Bakiye: 0,00 TL';
    
  pdf.text(fixTurkishChars(bakiyeText), leftMargin, currentY);
  
  // Alt bilgi
  currentY = pageHeight - 20;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(fixTurkishChars(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`), leftMargin, currentY);
  pdf.text(fixTurkishChars(`Toplam Islem Sayisi: ${data.islemler.length}`), pageWidth - rightMargin - 60, currentY);
  
  return pdf;
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
