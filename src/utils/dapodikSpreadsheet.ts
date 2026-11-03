import { Siswa, SekolahInfo } from '../types/dapodik';

export const OFFICIAL_DAPODIK_COLUMNS = [
  'No',
  'Nama',
  'NIPD',
  'JK',
  'NISN',
  'Tempat Lahir',
  'Tanggal Lahir',
  'NIK',
  'Agama',
  'Alamat',
  'RT',
  'RW',
  'Dusun',
  'Kelurahan',
  'Kecamatan',
  'Kode Pos',
  'Jenis Tinggal',
  'Alat Transportasi',
  'Telepon',
  'HP',
  'E-Mail',
  'SKHUN',
  'Penerima KPS',
  'No. KPS',
  'Nama Ayah',
  'Tahun Lahir Ayah',
  'Jenjang Pendidikan Ayah',
  'Pekerjaan Ayah',
  'Penghasilan Ayah',
  'NIK Ayah',
  'Nama Ibu',
  'Tahun Lahir Ibu',
  'Jenjang Pendidikan Ibu',
  'Pekerjaan Ibu',
  'Penghasilan Ibu',
  'NIK Ibu',
  'Nama Wali',
  'Tahun Lahir Wali',
  'Jenjang Pendidikan Wali',
  'Pekerjaan Wali',
  'Penghasilan Wali',
  'NIK Wali',
  'Rombel Saat Ini',
  'No Peserta Ujian Nasional',
  'No Seri Ijazah',
  'Penerima KIP',
  'Nomor KIP',
  'Nama di KIP',
  'Nomor KKS',
  'No Registrasi Akta Lahir',
  'Bank',
  'Nomor Rekening Bank',
  'Rekening Atas Nama',
  'Layak PIP (usulan dari sekolah)',
  'Alasan Layak PIP',
  'Kebutuhan Khusus',
  'Sekolah Asal',
  'Anak ke-berapa',
  'Lintang',
  'Bujur',
  'No KK',
  'Berat Badan',
  'Tinggi Badan',
  'Lingkar Kepala',
  'Jml. Saudara Kandung',
  'Jarak Rumah ke Sekolah',
];

// Helper to escape CSV cell
function escapeCsv(value: any): string {
  if (value === undefined || value === null) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

// Generate Official Dapodik CSV/Excel export
export function generateDapodikExportCsv(
  siswaList: Siswa[],
  sekolah: SekolahInfo | null
): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const namaSekolah = sekolah?.namaSekolah || 'SMAN 9 SURABAYA';
  const alamatSekolah = `Kecamatan Kec. Genteng, Kabupaten ${sekolah?.kota || 'Kota Surabaya'}, Provinsi ${sekolah?.provinsi || 'Prov. Jawa Timur'}`;
  const pengunduhInfo = `Tanggal Unduh: ${formattedDate}    Pengunduh: DWI WAHYU BUDIONO, S.SOS (dwiwahyubudiono11@gmail.com)`;

  const lines: string[] = [];

  // Baris 1-6 persis seperti tampilan berkas resmi Dapodik di gambar
  lines.push(`Daftar Peserta Didik`);
  lines.push(``);
  lines.push(`${namaSekolah}`);
  lines.push(`${alamatSekolah}`);
  lines.push(``);
  lines.push(`${pengunduhInfo}`);

  // Baris 7: Header Kolom
  lines.push(OFFICIAL_DAPODIK_COLUMNS.map((c) => `"${c}"`).join(';'));

  // Baris data siswa
  siswaList.forEach((s, idx) => {
    const row = [
      idx + 1, // No
      s.nama || '',
      s.nipd || '',
      s.jenisKelamin || 'L',
      s.nisn || '',
      s.tempatLahir || '',
      s.tanggalLahir || '',
      s.nik || '',
      s.agama || 'Islam',
      s.alamat || '',
      s.rt || '01',
      s.rw || '02',
      s.dusun || '-',
      s.kelurahan || s.alamat || '',
      s.kecamatan || 'Genteng',
      s.kodePos || '60272',
      s.jenisTinggal || 'Bersama orang tua',
      s.alatTransportasi || 'Sepeda Motor',
      s.telepon || '-',
      s.hp || s.noHpOrtu || '',
      s.email || '-',
      s.skhun || '-',
      s.penerimaKps || 'Tidak',
      s.noKps || '-',
      s.namaAyah || '',
      s.tahunLahirAyah || '1975',
      s.jenjangPendidikanAyah || 'S1',
      s.pekerjaanAyah || 'Karyawan Swasta',
      s.penghasilanAyah || 'Rp. 3.000.000 - Rp. 5.000.000',
      s.nikAyah || '',
      s.namaIbu || '',
      s.tahunLahirIbu || '1978',
      s.jenjangPendidikanIbu || 'SMA / Sederajat',
      s.pekerjaanIbu || 'Ibu Rumah Tangga',
      s.penghasilanIbu || 'Tidak Berpenghasilan',
      s.nikIbu || '',
      s.namaWali || '-',
      s.tahunLahirWali || '-',
      s.jenjangPendidikanWali || '-',
      s.pekerjaanWali || '-',
      s.penghasilanWali || '-',
      s.nikWali || '-',
      s.rombel || 'X-1', // Rombel Saat Ini
      s.noPesertaUn || '-',
      s.noSeriIjazah || '-',
      s.penerimaKip || 'Tidak',
      s.nomorKip || '-',
      s.namaDiKip || '-',
      s.nomorKks || '-',
      s.noRegAktaLahir || '-',
      s.bank || 'Bank Jatim',
      s.nomorRekeningBank || '-',
      s.rekeningAtasNama || s.nama || '',
      s.layakPip || 'Tidak',
      s.alasanLayakPip || '-',
      s.kebutuhanKhusus || 'Tidak ada',
      s.sekolahAsal || 'SMP Negeri',
      s.anakKe || 1,
      s.lintang || '-7.2575',
      s.bujur || '112.7521',
      s.noKk || '',
      s.beratBadan || 50,
      s.tinggiBadan || 165,
      s.lingkarKepala || 54,
      s.jmlSaudaraKandung || 1,
      s.jarakRumahKeSekolah || 'Kurang dari 5 km',
    ];

    lines.push(row.map(escapeCsv).join(';'));
  });

  return lines.join('\r\n');
}

// Generate Concise Dapodik CSV summary export
export function generateDapodikSummaryCsv(
  siswaList: Siswa[],
  sekolah: SekolahInfo | null
): string {
  const lines: string[] = [];
  const namaSekolah = sekolah?.namaSekolah || 'SMAN 9 SURABAYA';
  const now = new Date().toISOString().slice(0, 10);

  lines.push(`Rekapitulasi Data Peserta Didik - ${namaSekolah}`);
  lines.push(`Tanggal Cetak / Ekspor: ${now}`);
  lines.push('');

  const headers = [
    'No',
    'Nama Lengkap',
    'NIPD',
    'JK',
    'NISN',
    'NIK',
    'Tempat Lahir',
    'Tanggal Lahir',
    'Agama',
    'Rombel',
    'Nama Ayah',
    'Nama Ibu',
    'No HP / WA',
    'Status KIP/PIP',
    'Status Dapodik',
  ];

  lines.push(headers.map((h) => `"${h}"`).join(';'));

  siswaList.forEach((s, idx) => {
    const row = [
      idx + 1,
      s.nama || '',
      s.nipd || '',
      s.jenisKelamin || 'L',
      s.nisn || '',
      s.nik || '',
      s.tempatLahir || '',
      s.tanggalLahir || '',
      s.agama || '',
      s.rombel || '',
      s.namaAyah || '',
      s.namaIbu || '',
      s.noHpOrtu || s.hp || '',
      s.penerimaKip === 'Ya' || s.layakPip === 'Ya' ? 'KIP/PIP' : 'Non-PIP',
      s.statusValidasiDapodik || 'Valid',
    ];
    lines.push(row.map(escapeCsv).join(';'));
  });

  return lines.join('\r\n');
}

// Parse Official Dapodik CSV / Excel
export function parseDapodikImportCsv(csvContent: string): Partial<Siswa>[] {
  const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  // Detect delimiter: semicolon, comma, or tab
  let delimiter = ';';
  for (const line of lines) {
    if (line.includes(';') && (line.includes('Nama') || line.includes('NISN') || line.includes('NIPD'))) {
      delimiter = ';';
      break;
    }
    if (line.includes(',') && (line.includes('Nama') || line.includes('NISN') || line.includes('NIPD'))) {
      delimiter = ',';
      break;
    }
    if (line.includes('\t') && (line.includes('Nama') || line.includes('NISN') || line.includes('NIPD'))) {
      delimiter = '\t';
      break;
    }
  }

  // Find header row (the line containing "Nama" and ("NISN" or "NIPD" or "JK"))
  let headerIndex = -1;
  let headers: string[] = [];

  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const rawTokens = splitCsvLine(lines[i], delimiter);
    const cleaned = rawTokens.map((t) => t.toLowerCase().replace(/[^a-z0-9]/g, ''));
    if (
      cleaned.includes('nama') &&
      (cleaned.includes('nisn') || cleaned.includes('nipd') || cleaned.includes('jk'))
    ) {
      headerIndex = i;
      headers = rawTokens.map((t) => t.trim());
      break;
    }
  }

  // If header not found in first 15 lines, fallback to line 0
  if (headerIndex === -1) {
    headerIndex = 0;
    headers = splitCsvLine(lines[0], delimiter).map((t) => t.trim());
  }

  // Column index map
  const colMap = new Map<string, number>();
  headers.forEach((h, idx) => {
    const key = h.toLowerCase().replace(/[^a-z0-9]/g, '');
    colMap.set(key, idx);
  });

  const getVal = (row: string[], ...keys: string[]): string => {
    for (const key of keys) {
      const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      const idx = colMap.get(cleanKey);
      if (idx !== undefined && idx < row.length) {
        return row[idx].trim();
      }
    }
    return '';
  };

  const results: Partial<Siswa>[] = [];

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const row = splitCsvLine(lines[i], delimiter);
    if (row.length < 3) continue;

    const nama = getVal(row, 'Nama', 'Nama Peserta Didik');
    if (!nama) continue;

    const nisn = getVal(row, 'NISN');
    const nipd = getVal(row, 'NIPD', 'NIS');
    const jkRaw = getVal(row, 'JK', 'Jenis Kelamin');
    const jk: 'L' | 'P' = jkRaw.toUpperCase().startsWith('P') ? 'P' : 'L';
    const nik = getVal(row, 'NIK', 'NIK Siswa');
    const tempatLahir = getVal(row, 'Tempat Lahir');
    const tanggalLahir = getVal(row, 'Tanggal Lahir');
    const agama = getVal(row, 'Agama') || 'Islam';
    const alamat = getVal(row, 'Alamat');
    const rombel = getVal(row, 'Rombel Saat Ini', 'Rombel', 'Kelas');

    const s: Partial<Siswa> = {
      nama,
      nisn: nisn || `00${Math.floor(80000000 + Math.random() * 19999999)}`,
      nipd: nipd || '24000',
      jenisKelamin: jk,
      nik: nik || `35780${Math.floor(10000000000 + Math.random() * 90000000000)}`,
      tempatLahir: tempatLahir || 'Surabaya',
      tanggalLahir: tanggalLahir || '2008-01-01',
      agama,
      alamat: alamat || 'Surabaya',
      rt: getVal(row, 'RT'),
      rw: getVal(row, 'RW'),
      dusun: getVal(row, 'Dusun'),
      kelurahan: getVal(row, 'Kelurahan'),
      kecamatan: getVal(row, 'Kecamatan'),
      kodePos: getVal(row, 'Kode Pos'),
      jenisTinggal: getVal(row, 'Jenis Tinggal'),
      alatTransportasi: getVal(row, 'Alat Transportasi'),
      telepon: getVal(row, 'Telepon'),
      hp: getVal(row, 'HP', 'No HP'),
      email: getVal(row, 'E-Mail', 'Email'),
      skhun: getVal(row, 'SKHUN'),
      penerimaKps: getVal(row, 'Penerima KPS'),
      noKps: getVal(row, 'No. KPS', 'No KPS'),
      namaAyah: getVal(row, 'Nama Ayah') || 'Ayah',
      tahunLahirAyah: getVal(row, 'Tahun Lahir Ayah'),
      jenjangPendidikanAyah: getVal(row, 'Jenjang Pendidikan Ayah'),
      pekerjaanAyah: getVal(row, 'Pekerjaan Ayah'),
      penghasilanAyah: getVal(row, 'Penghasilan Ayah'),
      nikAyah: getVal(row, 'NIK Ayah'),
      namaIbu: getVal(row, 'Nama Ibu') || 'Ibu',
      tahunLahirIbu: getVal(row, 'Tahun Lahir Ibu'),
      jenjangPendidikanIbu: getVal(row, 'Jenjang Pendidikan Ibu'),
      pekerjaanIbu: getVal(row, 'Pekerjaan Ibu'),
      penghasilanIbu: getVal(row, 'Penghasilan Ibu'),
      nikIbu: getVal(row, 'NIK Ibu'),
      namaWali: getVal(row, 'Nama Wali'),
      tahunLahirWali: getVal(row, 'Tahun Lahir Wali'),
      jenjangPendidikanWali: getVal(row, 'Jenjang Pendidikan Wali'),
      pekerjaanWali: getVal(row, 'Pekerjaan Wali'),
      penghasilanWali: getVal(row, 'Penghasilan Wali'),
      nikWali: getVal(row, 'NIK Wali'),
      rombel: rombel || 'X-1',
      noPesertaUn: getVal(row, 'No Peserta Ujian Nasional', 'No Peserta UN'),
      noSeriIjazah: getVal(row, 'No Seri Ijazah'),
      penerimaKip: getVal(row, 'Penerima KIP'),
      nomorKip: getVal(row, 'Nomor KIP'),
      namaDiKip: getVal(row, 'Nama di KIP'),
      nomorKks: getVal(row, 'Nomor KKS'),
      noRegAktaLahir: getVal(row, 'No Registrasi Akta Lahir'),
      bank: getVal(row, 'Bank'),
      nomorRekeningBank: getVal(row, 'Nomor Rekening Bank'),
      rekeningAtasNama: getVal(row, 'Rekening Atas Nama'),
      layakPip: getVal(row, 'Layak PIP (usulan dari sekolah)', 'Layak PIP'),
      alasanLayakPip: getVal(row, 'Alasan Layak PIP'),
      kebutuhanKhusus: getVal(row, 'Kebutuhan Khusus'),
      sekolahAsal: getVal(row, 'Sekolah Asal'),
      anakKe: getVal(row, 'Anak ke-berapa', 'Anak ke'),
      lintang: getVal(row, 'Lintang'),
      bujur: getVal(row, 'Bujur'),
      noKk: getVal(row, 'No KK'),
      beratBadan: getVal(row, 'Berat Badan'),
      tinggiBadan: getVal(row, 'Tinggi Badan'),
      lingkarKepala: getVal(row, 'Lingkar Kepala'),
      jmlSaudaraKandung: getVal(row, 'Jml. Saudara Kandung', 'Jumlah Saudara'),
      jarakRumahKeSekolah: getVal(row, 'Jarak Rumah ke Sekolah'),
      statusSiswa: 'Aktif',
      statusValidasiDapodik: 'Valid',
      syncStatus: 'synced',
    };

    results.push(s);
  }

  return results;
}

// Split CSV line respecting quotes
function splitCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Sample Official Dapodik Students
export function getOfficialDapodikSampleStudents(): Partial<Siswa>[] {
  return [
    {
      nama: 'ACHMAD FATHONI HIDAYAT',
      nipd: '24001',
      jenisKelamin: 'L',
      nisn: '0085421980',
      tempatLahir: 'Surabaya',
      tanggalLahir: '2008-04-12',
      nik: '3578011204080001',
      agama: 'Islam',
      alamat: 'Jl. Kusuma Bangsa No. 15',
      rt: '02',
      rw: '03',
      dusun: '-',
      kelurahan: 'Ketabang',
      kecamatan: 'Genteng',
      kodePos: '60272',
      jenisTinggal: 'Bersama orang tua',
      alatTransportasi: 'Sepeda Motor',
      telepon: '-',
      hp: '081234567801',
      email: 'achmad.fathoni@siswa.sman9sby.sch.id',
      skhun: '2024-SMP-0912',
      penerimaKps: 'Tidak',
      noKps: '-',
      namaAyah: 'Hidayatullah, S.T.',
      tahunLahirAyah: '1975',
      jenjangPendidikanAyah: 'S1',
      pekerjaanAyah: 'Wiraswasta',
      penghasilanAyah: 'Rp. 3.000.000 - Rp. 5.000.000',
      nikAyah: '3578011005750001',
      namaIbu: 'Siti Rohmah',
      tahunLahirIbu: '1979',
      jenjangPendidikanIbu: 'SMA',
      pekerjaanIbu: 'Ibu Rumah Tangga',
      penghasilanIbu: 'Tidak Berpenghasilan',
      nikIbu: '3578015508790002',
      namaWali: '-',
      tahunLahirWali: '-',
      jenjangPendidikanWali: '-',
      pekerjaanWali: '-',
      penghasilanWali: '-',
      nikWali: '-',
      rombel: 'X-1 (Fase E)',
      noPesertaUn: '05-091-001-8',
      noSeriIjazah: 'DN-05/D-SMP/K13/24/001429',
      penerimaKip: 'Ya',
      nomorKip: 'KIP-2024-88912',
      namaDiKip: 'ACHMAD FATHONI HIDAYAT',
      nomorKks: 'KKS-3578-0012',
      noRegAktaLahir: '3578-LT-12042008-001',
      bank: 'Bank Jatim',
      nomorRekeningBank: '0019283746',
      rekeningAtasNama: 'ACHMAD FATHONI HIDAYAT',
      layakPip: 'Ya',
      alasanLayakPip: 'Pemegang KIP / KKS Aktif',
      kebutuhanKhusus: 'Tidak ada',
      sekolahAsal: 'SMP Negeri 1 Surabaya',
      anakKe: 1,
      lintang: '-7.2575',
      bujur: '112.7521',
      noKk: '3578012004080005',
      beratBadan: 54,
      tinggiBadan: 168,
      lingkarKepala: 55,
      jmlSaudaraKandung: 2,
      jarakRumahKeSekolah: 'Kurang dari 3 km',
      statusSiswa: 'Aktif',
      statusValidasiDapodik: 'Valid',
      syncStatus: 'synced',
    },
    {
      nama: 'BELLA AURELIA PUTRI',
      nipd: '24002',
      jenisKelamin: 'P',
      nisn: '0089124451',
      tempatLahir: 'Sidoarjo',
      tanggalLahir: '2008-09-24',
      nik: '3578046409080002',
      agama: 'Islam',
      alamat: 'Jl. Wijaya Kusuma No. 8',
      rt: '04',
      rw: '01',
      dusun: '-',
      kelurahan: 'Genteng',
      kecamatan: 'Genteng',
      kodePos: '60272',
      jenisTinggal: 'Bersama orang tua',
      alatTransportasi: 'Jalan Kaki',
      telepon: '-',
      hp: '081398765402',
      email: 'bella.aurelia@siswa.sman9sby.sch.id',
      skhun: '2024-SMP-0913',
      penerimaKps: 'Tidak',
      noKps: '-',
      namaAyah: 'Budi Santoso',
      tahunLahirAyah: '1973',
      jenjangPendidikanAyah: 'D3',
      pekerjaanAyah: 'Karyawan Swasta',
      penghasilanAyah: 'Rp. 5.000.000 - Rp. 10.000.000',
      nikAyah: '3578041503730001',
      namaIbu: 'Dewi Kartika, S.Pd.',
      tahunLahirIbu: '1976',
      jenjangPendidikanIbu: 'S1',
      pekerjaanIbu: 'PNS',
      penghasilanIbu: 'Rp. 3.000.000 - Rp. 5.000.000',
      nikIbu: '3578045207760003',
      namaWali: '-',
      tahunLahirWali: '-',
      jenjangPendidikanWali: '-',
      pekerjaanWali: '-',
      penghasilanWali: '-',
      nikWali: '-',
      rombel: 'X-1 (Fase E)',
      noPesertaUn: '05-091-002-7',
      noSeriIjazah: 'DN-05/D-SMP/K13/24/001430',
      penerimaKip: 'Tidak',
      nomorKip: '-',
      namaDiKip: '-',
      nomorKks: '-',
      noRegAktaLahir: '3578-LT-24092008-002',
      bank: 'Bank Jatim',
      nomorRekeningBank: '0019283747',
      rekeningAtasNama: 'BELLA AURELIA PUTRI',
      layakPip: 'Tidak',
      alasanLayakPip: '-',
      kebutuhanKhusus: 'Tidak ada',
      sekolahAsal: 'SMP Negeri 3 Surabaya',
      anakKe: 2,
      lintang: '-7.2612',
      bujur: '112.7489',
      noKk: '3578041503730010',
      beratBadan: 48,
      tinggiBadan: 160,
      lingkarKepala: 53,
      jmlSaudaraKandung: 1,
      jarakRumahKeSekolah: 'Kurang dari 1 km',
      statusSiswa: 'Aktif',
      statusValidasiDapodik: 'Valid',
      syncStatus: 'synced',
    },
    {
      nama: 'CHRISTIAN KEVIN TANUWIJAYA',
      nipd: '24003',
      jenisKelamin: 'L',
      nisn: '0087789012',
      tempatLahir: 'Surabaya',
      tanggalLahir: '2008-11-19',
      nik: '3578021911080003',
      agama: 'Kristen',
      alamat: 'Jl. Ngagel Jaya Tengah No. 44',
      rt: '03',
      rw: '05',
      dusun: '-',
      kelurahan: 'Pucang Sewu',
      kecamatan: 'Gubeng',
      kodePos: '60283',
      jenisTinggal: 'Bersama orang tua',
      alatTransportasi: 'Mobil Pribadi',
      telepon: '0315023456',
      hp: '081211223303',
      email: 'christian.kevin@siswa.sman9sby.sch.id',
      skhun: '2024-SMP-0914',
      penerimaKps: 'Tidak',
      noKps: '-',
      namaAyah: 'Hendro Tanuwijaya',
      tahunLahirAyah: '1970',
      jenjangPendidikanAyah: 'S1',
      pekerjaanAyah: 'Pedagang / Wiraswasta',
      penghasilanAyah: 'Lebih dari Rp. 10.000.000',
      nikAyah: '3578021105700001',
      namaIbu: 'Lina Marlina',
      tahunLahirIbu: '1974',
      jenjangPendidikanIbu: 'S1',
      pekerjaanIbu: 'Wiraswasta',
      penghasilanIbu: 'Rp. 5.000.000 - Rp. 10.000.000',
      nikIbu: '3578025208740002',
      namaWali: '-',
      tahunLahirWali: '-',
      jenjangPendidikanWali: '-',
      pekerjaanWali: '-',
      penghasilanWali: '-',
      nikWali: '-',
      rombel: 'X-2 (Fase E)',
      noPesertaUn: '05-091-003-6',
      noSeriIjazah: 'DN-05/D-SMP/K13/24/001431',
      penerimaKip: 'Tidak',
      nomorKip: '-',
      namaDiKip: '-',
      nomorKks: '-',
      noRegAktaLahir: '3578-LT-19112008-003',
      bank: 'Bank Jatim',
      nomorRekeningBank: '0019283748',
      rekeningAtasNama: 'CHRISTIAN KEVIN TANUWIJAYA',
      layakPip: 'Tidak',
      alasanLayakPip: '-',
      kebutuhanKhusus: 'Tidak ada',
      sekolahAsal: 'SMP Katolik Santa Clara',
      anakKe: 1,
      lintang: '-7.2891',
      bujur: '112.7592',
      noKk: '3578021105700020',
      beratBadan: 62,
      tinggiBadan: 172,
      lingkarKepala: 56,
      jmlSaudaraKandung: 1,
      jarakRumahKeSekolah: '3 - 5 km',
      statusSiswa: 'Aktif',
      statusValidasiDapodik: 'Valid',
      syncStatus: 'synced',
    },
  ];
}
