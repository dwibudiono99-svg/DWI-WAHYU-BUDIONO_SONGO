import { GTK, SekolahInfo } from '../types/dapodik';

function escapeCsv(value: any): string {
  if (value === undefined || value === null) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

export function generateGtkExportCsv(
  gtkList: GTK[],
  sekolah: SekolahInfo | null
): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const namaSekolah = sekolah?.namaSekolah || 'SMAN 9 SURABAYA';
  const npsn = sekolah?.npsn || '20532189';
  const alamatSekolah = sekolah?.alamat || 'Jl. Wijaya Kusuma No. 48, Ketabang, Kec. Genteng, Kota Surabaya';

  const lines: string[] = [];

  // Kop informasi laporan
  lines.push(`Daftar Pendidik dan Tenaga Kependidikan (GTK)`);
  lines.push(``);
  lines.push(`${namaSekolah} (NPSN: ${npsn})`);
  lines.push(`${alamatSekolah}`);
  lines.push(`Semester: ${sekolah?.semesterAktif || '2025/2026 Genap'}`);
  lines.push(`Tanggal Ekspor: ${formattedDate}    Total GTK: ${gtkList.length}`);
  lines.push(``);

  // Header Kolom
  const headers = [
    'No',
    'Nama Lengkap',
    'NIP',
    'NUPTK',
    'NIK',
    'JK',
    'Tempat Lahir',
    'Tanggal Lahir',
    'Agama',
    'Status Kepegawaian',
    'Pangkat / Golongan',
    'Jenis PTK',
    'SK Pengangkatan',
    'TMT Pengangkatan',
    'Pendidikan Terakhir',
    'Bidang Studi / Mapel',
    'Status Sertifikasi',
    'No. Sertifikat Pendidik',
    'Jam Mengajar/Minggu (JJM)',
    'No. HP / WhatsApp',
    'E-Mail',
    'Status Sinkronisasi Dapodik',
  ];

  lines.push(headers.map((h) => `"${h}"`).join(';'));

  // Data baris
  gtkList.forEach((g, idx) => {
    const row = [
      idx + 1,
      g.nama || '',
      g.nip || '-',
      g.nuptk || '-',
      g.nik || '-',
      g.jenisKelamin || 'L',
      g.tempatLahir || '',
      g.tanggalLahir || '',
      g.agama || 'Islam',
      g.statusKepegawaian || '',
      g.pangkatGolongan || '-',
      g.jenisPtk || 'Guru Mapel',
      g.skPengangkatan || '-',
      g.tmtPengangkatan || '-',
      g.pendidikanTerakhir || '-',
      g.bidangStudi || '-',
      g.statusSertifikasi || 'Belum Bersertifikasi',
      g.nomorSertifikatPendidik || '-',
      g.jamMengajarPerMinggu || 0,
      g.noHp || '-',
      g.email || '-',
      g.syncStatus === 'synced' ? 'Tersinkron' : 'Pending',
    ];
    lines.push(row.map(escapeCsv).join(';'));
  });

  return lines.join('\r\n');
}
