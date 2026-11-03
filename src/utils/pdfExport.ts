import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GTK, Siswa, SekolahInfo } from '../types/dapodik';

function formatDateIndo(date: Date): string {
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Draw Official Indonesian School Letterhead (Kop Surat)
function drawKopSurat(doc: jsPDF, sekolah: SekolahInfo | null, pageWidth: number): number {
  const centerX = pageWidth / 2;
  let y = 12;

  // Header texts
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('PEMERINTAH PROVINSI JAWA TIMUR', centerX, y, { align: 'center' });

  y += 4.5;
  doc.text('DINAS PENDIDIKAN', centerX, y, { align: 'center' });

  y += 5.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  const schoolName = sekolah?.namaSekolah || 'SEKOLAH MENENGAH ATAS NEGERI 9 SURABAYA';
  doc.text(schoolName.toUpperCase(), centerX, y, { align: 'center' });

  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const alamat = sekolah?.alamat || 'Jl. Wijaya Kusuma No. 48, Ketabang, Kec. Genteng, Kota Surabaya';
  doc.text(alamat, centerX, y, { align: 'center' });

  y += 3.8;
  const npsn = sekolah?.npsn || '20532189';
  doc.text(
    `NPSN: ${npsn} | Akreditasi: A (Unggul) | Website: sman9sby.sch.id | Email: smanixsurabaya@gmail.com`,
    centerX,
    y,
    { align: 'center' }
  );

  y += 3.5;
  // Double horizontal rule for authentic Kop Surat
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(1.2);
  doc.line(14, y, pageWidth - 14, y);

  y += 0.8;
  doc.setLineWidth(0.4);
  doc.line(14, y, pageWidth - 14, y);

  return y + 6;
}

// Draw Signature block at the end of report
function drawSignatures(
  doc: jsPDF,
  sekolah: SekolahInfo | null,
  startY: number,
  pageWidth: number,
  pageHeight: number
) {
  let y = startY + 6;

  // If not enough room on current page, add new page
  if (y + 35 > pageHeight - 15) {
    doc.addPage();
    y = 20;
  }

  const currentDate = formatDateIndo(new Date());
  const leftX = 25;
  const rightX = pageWidth - 75;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  // Right column: Date & Kepala Sekolah
  doc.text(`Surabaya, ${currentDate}`, rightX, y);
  y += 4.5;
  doc.text('Mengetahui,', rightX, y);
  doc.text('Petugas Administrasi / SIM,', leftX, y);

  y += 4;
  doc.text('Kepala SMAN 9 Surabaya', rightX, y);

  y += 20; // Space for physical signature / stempel

  doc.setFont('helvetica', 'bold');
  const kepsekNama = sekolah?.kepalaSekolah || 'Drs. H. M. Sulaiman, M.Pd.';
  const kepsekNip = sekolah?.nipKepalaSekolah || '196705121992031005';

  doc.text(kepsekNama, rightX, y);
  doc.text('DWI WAHYU BUDIONO, S.Sos.', leftX, y);

  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.text(`NIP. ${kepsekNip}`, rightX, y);
  doc.text('NIP. - (Operator Dapodik)', leftX, y);
}

// 1. EXPORT GTK TO PDF
export function exportGtkPdf(
  gtkList: GTK[],
  sekolah: SekolahInfo | null,
  filterInfo?: string
): void {
  // A4 Landscape: 297mm x 210mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Draw Kop Surat
  let startY = drawKopSurat(doc, sekolah, pageWidth);

  // Report Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('LAPORAN DATA PENDIDIK DAN TENAGA KEPENDIDIKAN (GTK)', pageWidth / 2, startY, {
    align: 'center',
  });

  startY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const metaText = `Tahun Pelajaran: ${sekolah?.semesterAktif || '2025/2026 Genap'} | Total Data: ${
    gtkList.length
  } Personel${filterInfo ? ` | Filter: ${filterInfo}` : ''}`;
  doc.text(metaText, pageWidth / 2, startY, { align: 'center' });

  startY += 4;

  // Table Data
  const tableData = gtkList.map((g, idx) => [
    idx + 1,
    g.nama || '-',
    g.nip && g.nip !== '-' ? g.nip : 'Non-NIP',
    g.jenisKelamin || 'L',
    g.nuptk || '-',
    g.statusKepegawaian || '-',
    g.pangkatGolongan || '-',
    g.jenisPtk || 'Guru Mapel',
    g.bidangStudi || '-',
    g.statusSertifikasi === 'Sudah Bersertifikasi' ? 'Bersertifikasi' : 'Belum',
    `${g.jamMengajarPerMinggu || 0} Jam`,
    g.noHp || '-',
  ]);

  autoTable(doc, {
    startY: startY,
    head: [
      [
        'No',
        'Nama Lengkap',
        'NIP',
        'JK',
        'NUPTK',
        'Status',
        'Gol',
        'Jabatan / PTK',
        'Bidang Studi',
        'Sertifikasi',
        'JJM',
        'No. HP',
      ],
    ],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.15,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [15, 23, 42], // Slate-900 / Navy
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 42, fontStyle: 'bold' },
      2: { cellWidth: 32 },
      3: { halign: 'center', cellWidth: 10 },
      4: { cellWidth: 26 },
      5: { cellWidth: 22 },
      6: { halign: 'center', cellWidth: 16 },
      7: { cellWidth: 26 },
      8: { cellWidth: 30 },
      9: { halign: 'center', cellWidth: 20 },
      10: { halign: 'center', cellWidth: 14 },
      11: { cellWidth: 21 },
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer page numbering
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Dicetak dari SIM Dapodik & Kepegawaian SMAN 9 Surabaya - Halaman ${data.pageNumber}`,
        14,
        pageHeight - 6
      );
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || startY + 40;
  drawSignatures(doc, sekolah, finalY, pageWidth, pageHeight);

  // Trigger Save/Download PDF
  const timestamp = new Date().toISOString().slice(0, 10);
  doc.save(`Laporan_GTK_Kepegawaian_SMAN9_${timestamp}.pdf`);
}

// 2. EXPORT SISWA TO PDF
export function exportSiswaPdf(
  siswaList: Siswa[],
  sekolah: SekolahInfo | null,
  filterInfo?: string
): void {
  // A4 Landscape: 297mm x 210mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Draw Kop Surat
  let startY = drawKopSurat(doc, sekolah, pageWidth);

  // Report Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('LAPORAN DATA POKOK PESERTA DIDIK (DAPODIK)', pageWidth / 2, startY, {
    align: 'center',
  });

  startY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const metaText = `Tahun Pelajaran: ${sekolah?.semesterAktif || '2025/2026 Genap'} | Total Data: ${
    siswaList.length
  } Siswa${filterInfo ? ` | Filter: ${filterInfo}` : ''}`;
  doc.text(metaText, pageWidth / 2, startY, { align: 'center' });

  startY += 4;

  // Table Data
  const tableData = siswaList.map((s, idx) => [
    idx + 1,
    s.nama || '-',
    s.nipd || '-',
    s.jenisKelamin || 'L',
    s.nisn || '-',
    s.nik || '-',
    `${s.tempatLahir || '-'}, ${s.tanggalLahir || '-'}`,
    s.rombel || '-',
    s.namaAyah || '-',
    s.namaIbu || '-',
    s.penerimaKip === 'Ya' || s.layakPip === 'Ya' ? 'KIP/PIP' : 'Non-PIP',
    s.statusValidasiDapodik || 'Valid',
  ]);

  autoTable(doc, {
    startY: startY,
    head: [
      [
        'No',
        'Nama Lengkap Siswa',
        'NIPD',
        'JK',
        'NISN',
        'NIK',
        'Tempat, Tanggal Lahir',
        'Rombel',
        'Nama Ayah',
        'Nama Ibu',
        'Bantuan',
        'Status',
      ],
    ],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.15,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [15, 23, 42], // Slate-900 / Navy
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 44, fontStyle: 'bold' },
      2: { cellWidth: 18, halign: 'center' },
      3: { halign: 'center', cellWidth: 10 },
      4: { cellWidth: 24, halign: 'center' },
      5: { cellWidth: 32 },
      6: { cellWidth: 36 },
      7: { cellWidth: 20 },
      8: { cellWidth: 26 },
      9: { cellWidth: 26 },
      10: { halign: 'center', cellWidth: 16 },
      11: { halign: 'center', cellWidth: 17 },
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer page numbering
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Dicetak dari SIM Dapodik & Kepegawaian SMAN 9 Surabaya - Halaman ${data.pageNumber}`,
        14,
        pageHeight - 6
      );
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || startY + 40;
  drawSignatures(doc, sekolah, finalY, pageWidth, pageHeight);

  // Trigger Save/Download PDF
  const timestamp = new Date().toISOString().slice(0, 10);
  doc.save(`Laporan_Dapodik_Peserta_Didik_SMAN9_${timestamp}.pdf`);
}
