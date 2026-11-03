export interface SekolahInfo {
  npsn: string;
  namaSekolah: string;
  bentukPendidikan: string;
  statusSekolah: string;
  alamat: string;
  kota: string;
  provinsi: string;
  kodePos: string;
  akreditasi: string;
  kurikulum: string;
  semesterAktif: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  lastSyncTime: string;
  apiEndpoint: string;
  apiToken: string;
  autoSyncEnabled: boolean;
  autoSyncIntervalSec: number;
}

export type StatusKepegawaian =
  | 'PNS'
  | 'PPPK'
  | 'GTT / Honorer Sekolah'
  | 'PTT / Tenaga Administrasi'
  | 'Guru Tetap Yayasan';

export type SyncStatus = 'synced' | 'pending_sync' | 'sync_error';

export interface GTK {
  id: string;
  nik: string;
  nip: string;
  nuptk: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  tempatLahir: string;
  tanggalLahir: string;
  agama: string;
  statusKepegawaian: StatusKepegawaian;
  jenisPtk: string;
  pangkatGolongan: string;
  skPengangkatan: string;
  tmtPengangkatan: string;
  pendidikanTerakhir: string;
  bidangStudi: string;
  statusSertifikasi: 'Sudah Bersertifikasi' | 'Belum Bersertifikasi' | 'Bukan Guru';
  nomorSertifikatPendidik: string;
  jamMengajarPerMinggu: number;
  noHp: string;
  email: string;
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
}

export interface Siswa {
  id: string;
  // Kolom 1-9: Identitas Utama
  nama: string;
  nipd: string;
  jenisKelamin: 'L' | 'P';
  nisn: string;
  tempatLahir: string;
  tanggalLahir: string;
  nik: string;
  agama: string;

  // Kolom 10-21: Alamat & Kontak
  alamat: string;
  rt?: string;
  rw?: string;
  dusun?: string;
  kelurahan?: string;
  kecamatan?: string;
  kodePos?: string;
  jenisTinggal?: string;
  alatTransportasi?: string;
  telepon?: string;
  hp?: string;
  email?: string;

  // Kolom 22-24: Ujian & KPS
  skhun?: string;
  penerimaKps?: 'Ya' | 'Tidak' | string;
  noKps?: string;

  // Kolom 25-30: Data Ayah
  namaAyah: string;
  tahunLahirAyah?: string;
  jenjangPendidikanAyah?: string;
  pekerjaanAyah?: string;
  penghasilanAyah?: string;
  nikAyah?: string;

  // Kolom 31-36: Data Ibu
  namaIbu: string;
  tahunLahirIbu?: string;
  jenjangPendidikanIbu?: string;
  pekerjaanIbu?: string;
  penghasilanIbu?: string;
  nikIbu?: string;

  // Kolom 37-42: Data Wali
  namaWali?: string;
  tahunLahirWali?: string;
  jenjangPendidikanWali?: string;
  pekerjaanWali?: string;
  penghasilanWali?: string;
  nikWali?: string;

  // Kolom 43-45: Rombel & Akademik
  rombel: string; // Rombel Saat Ini
  tingkatKelas?: string;
  jurusan?: string;
  noPesertaUn?: string;
  noSeriIjazah?: string;

  // Kolom 46-56: KIP, KKS, Bank, PIP
  penerimaKip?: 'Ya' | 'Tidak' | string;
  nomorKip?: string;
  namaDiKip?: string;
  nomorKks?: string;
  noRegAktaLahir?: string;
  bank?: string;
  nomorRekeningBank?: string;
  rekeningAtasNama?: string;
  layakPip?: 'Ya' | 'Tidak' | string;
  alasanLayakPip?: string;

  // Kolom 57-66: Data Fisik & Geografis
  kebutuhanKhusus?: string;
  sekolahAsal?: string;
  anakKe?: number | string;
  lintang?: string;
  bujur?: string;
  noKk?: string;
  beratBadan?: number | string;
  tinggiBadan?: number | string;
  lingkarKepala?: number | string;
  jmlSaudaraKandung?: number | string;
  jarakRumahKeSekolah?: string;

  // Kontak Ortu fallback
  noHpOrtu?: string;

  // Status Administrasi Web
  statusSiswa?: 'Aktif' | 'Mutasi Keluar' | 'Lulus' | 'Non-Aktif';
  statusValidasiDapodik?: 'Valid' | 'Warning' | 'Invalid';
  catatanValidasi?: string;
  syncStatus?: SyncStatus;
  lastSyncedAt?: string | null;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  type: string;
  direction: 'PULL' | 'PUSH' | 'BIDIRECTIONAL';
  status: 'SUCCESS' | 'ERROR' | 'RUNNING';
  gtkCount: number;
  siswaCount: number;
  message: string;
  durationMs: number;
}
