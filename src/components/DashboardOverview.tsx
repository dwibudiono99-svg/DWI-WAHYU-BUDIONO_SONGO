import React from 'react';
import {
  Users,
  GraduationCap,
  Award,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Building,
  Calendar,
  Database,
  ArrowUpRight,
  ShieldCheck,
  Plus,
  Upload,
  FileText,
} from 'lucide-react';
import { GTK, Siswa, SekolahInfo } from '../types/dapodik';
import { exportGtkPdf, exportSiswaPdf } from '../utils/pdfExport';

interface DashboardOverviewProps {
  sekolah: SekolahInfo | null;
  gtkList: GTK[];
  siswaList: Siswa[];
  onOpenGtkModal: () => void;
  onOpenSiswaModal: () => void;
  onOpenImportModal: () => void;
  onSync: () => void;
  isSyncing: boolean;
  onNavigateTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  sekolah,
  gtkList,
  siswaList,
  onOpenGtkModal,
  onOpenSiswaModal,
  onOpenImportModal,
  onSync,
  isSyncing,
  onNavigateTab,
}) => {
  // Kepegawaian statistics
  const pnsCount = gtkList.filter((g) => g.statusKepegawaian === 'PNS').length;
  const pppkCount = gtkList.filter((g) => g.statusKepegawaian === 'PPPK').length;
  const gttCount = gtkList.filter((g) => g.statusKepegawaian === 'GTT / Honorer Sekolah').length;
  const pttCount = gtkList.filter((g) => g.statusKepegawaian === 'PTT / Tenaga Administrasi').length;
  const sertifikasiCount = gtkList.filter((g) => g.statusSertifikasi === 'Sudah Bersertifikasi').length;
  const guruTotal = gtkList.filter((g) => g.statusSertifikasi !== 'Bukan Guru').length;
  const sertifikasiPct = guruTotal > 0 ? Math.round((sertifikasiCount / guruTotal) * 100) : 0;

  // Siswa statistics
  const siswaLaki = siswaList.filter((s) => s.jenisKelamin === 'L').length;
  const siswaPerempuan = siswaList.filter((s) => s.jenisKelamin === 'P').length;
  const validDapodik = siswaList.filter((s) => s.statusValidasiDapodik === 'Valid').length;
  const warningDapodik = siswaList.filter((s) => s.statusValidasiDapodik === 'Warning').length;
  const invalidDapodik = siswaList.filter((s) => s.statusValidasiDapodik === 'Invalid').length;

  const kelasX = siswaList.filter((s) => s.tingkatKelas === 'X').length;
  const kelasXI = siswaList.filter((s) => s.tingkatKelas === 'XI').length;
  const kelasXII = siswaList.filter((s) => s.tingkatKelas === 'XII').length;

  const pendingSyncGtk = gtkList.filter((g) => g.syncStatus === 'pending_sync').length;
  const pendingSyncSiswa = siswaList.filter((s) => s.syncStatus === 'pending_sync').length;
  const totalPending = pendingSyncGtk + pendingSyncSiswa;

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if any pending syncs */}
      {totalPending > 0 && (
        <div className="bg-amber-900/30 border border-amber-600/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-amber-200">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-semibold text-sm text-amber-100">
                Terdapat {totalPending} data lokal yang belum disinkronkan ke Web Service Dapodik
              </p>
              <p className="text-xs text-amber-300/80">
                {pendingSyncGtk} Guru/Tendik dan {pendingSyncSiswa} Siswa baru atau diperbarui secara lokal.
              </p>
            </div>
          </div>
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition active:scale-95 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sinkronkan Sekarang</span>
          </button>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: GTK / Kepegawaian */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Total Kepegawaian (GTK)</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white tracking-tight">{gtkList.length}</span>
            <span className="text-xs text-slate-400 font-medium">Orang</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>ASN: <strong className="text-slate-200">{pnsCount + pppkCount}</strong></span>
            <span>·</span>
            <span>Non-ASN: <strong className="text-slate-200">{gttCount + pttCount}</strong></span>
            <button
              onClick={() => onNavigateTab('gtk')}
              className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-0.5 ml-1"
            >
              Lihat <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* KPI 2: Sertifikasi Pendidik */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Sertifikasi Guru</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white tracking-tight">{sertifikasiPct}%</span>
            <span className="text-xs text-emerald-400 font-medium">({sertifikasiCount} dari {guruTotal} Guru)</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Linieritas SKTP: <strong className="text-emerald-300">100%</strong></span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">Valid TPG</span>
          </div>
        </div>

        {/* KPI 3: Peserta Didik (Siswa Dapodik) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Peserta Didik (Dapodik)</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white tracking-tight">{siswaList.length}</span>
            <span className="text-xs text-slate-400 font-medium">Siswa Aktif</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>L: <strong className="text-slate-200">{siswaLaki}</strong></span>
            <span>·</span>
            <span>P: <strong className="text-slate-200">{siswaPerempuan}</strong></span>
            <button
              onClick={() => onNavigateTab('siswa')}
              className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-0.5 ml-1"
            >
              Lihat <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* KPI 4: Integritas Validasi Dapodik */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Validasi Kemendikbud</span>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-emerald-400 tracking-tight">
              {siswaList.length > 0 ? Math.round((validDapodik / siswaList.length) * 100) : 100}%
            </span>
            <span className="text-xs text-slate-400 font-medium">Valid Dukcapil</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {validDapodik} Valid
            </span>
            {warningDapodik > 0 && (
              <span className="text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {warningDapodik} Warning
              </span>
            )}
            {invalidDapodik > 0 && (
              <span className="text-rose-400">
                {invalidDapodik} Invalid
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Kepegawaian Breakdown & Real-Time Sync Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Breakdown & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Kepegawaian Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-white">Struktur & Status Kepegawaian Guru / Tendik</h3>
                <p className="text-xs text-slate-400">Kualifikasi dan ikatan dinas pegawai SMAN 9 Surabaya</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => exportGtkPdf(gtkList, sekolah, 'Laporan Ringkasan Dashboard')}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-medium transition cursor-pointer"
                  title="Unduh Laporan GTK ke format PDF"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>PDF Laporan</span>
                </button>
                <button
                  onClick={onOpenGtkModal}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah GTK</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/60">
                <div className="text-xs text-slate-400 font-medium">PNS (Pegawai Negeri)</div>
                <div className="text-xl font-bold text-white mt-1">{pnsCount}</div>
                <div className="text-[11px] text-blue-400 mt-1 font-mono">Gol. III & IV</div>
              </div>
              <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/60">
                <div className="text-xs text-slate-400 font-medium">PPPK Jabatan Fungsional</div>
                <div className="text-xl font-bold text-white mt-1">{pppkCount}</div>
                <div className="text-[11px] text-emerald-400 mt-1 font-mono">Golongan IX</div>
              </div>
              <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/60">
                <div className="text-xs text-slate-400 font-medium">GTT (Guru Tidak Tetap)</div>
                <div className="text-xl font-bold text-white mt-1">{gttCount}</div>
                <div className="text-[11px] text-amber-400 mt-1 font-mono">Honor Sekolah/Komite</div>
              </div>
              <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/60">
                <div className="text-xs text-slate-400 font-medium">PTT / Tendik (TAS)</div>
                <div className="text-xl font-bold text-white mt-1">{pttCount}</div>
                <div className="text-[11px] text-indigo-400 mt-1 font-mono">Administrasi & Operator</div>
              </div>
            </div>

            {/* Linear Progress Bar for Kepegawaian */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>Komposisi Tenaga Pendidik & Kependidikan</span>
                <span>{gtkList.length} Total Pegawai</span>
              </div>
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${gtkList.length > 0 ? (pnsCount / gtkList.length) * 100 : 0}%` }}
                  className="bg-blue-500 h-full"
                  title={`PNS: ${pnsCount}`}
                />
                <div
                  style={{ width: `${gtkList.length > 0 ? (pppkCount / gtkList.length) * 100 : 0}%` }}
                  className="bg-emerald-500 h-full"
                  title={`PPPK: ${pppkCount}`}
                />
                <div
                  style={{ width: `${gtkList.length > 0 ? (gttCount / gtkList.length) * 100 : 0}%` }}
                  className="bg-amber-500 h-full"
                  title={`GTT: ${gttCount}`}
                />
                <div
                  style={{ width: `${gtkList.length > 0 ? (pttCount / gtkList.length) * 100 : 0}%` }}
                  className="bg-purple-500 h-full"
                  title={`PTT: ${pttCount}`}
                />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                  <span>PNS ({pnsCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  <span>PPPK ({pppkCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                  <span>GTT ({gttCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
                  <span>PTT Tendik ({pttCount})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Kesiswaan Distribution */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-semibold text-white">Distribusi Peserta Didik per Tingkat</h3>
                <p className="text-xs text-slate-400">Data rombel terdaftar dalam database Dapodik sekolah</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => exportSiswaPdf(siswaList, sekolah, 'Laporan Ringkasan Dashboard')}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-medium transition cursor-pointer"
                  title="Unduh Laporan Peserta Didik ke format PDF"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>PDF Laporan</span>
                </button>
                <button
                  onClick={onOpenImportModal}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-medium transition cursor-pointer"
                  title="Impor Peserta Didik dari Dapodik"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import dari Dapodik</span>
                </button>
                <button
                  onClick={onOpenSiswaModal}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Siswa</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700/60 text-center">
                <span className="text-xs text-slate-400 font-medium">Tingkat X (Fase E)</span>
                <div className="text-2xl font-bold text-white mt-1">{kelasX}</div>
                <span className="text-[11px] text-indigo-400 font-medium">Kurikulum Merdeka</span>
              </div>
              <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700/60 text-center">
                <span className="text-xs text-slate-400 font-medium">Tingkat XI (Fase F)</span>
                <div className="text-2xl font-bold text-white mt-1">{kelasXI}</div>
                <span className="text-[11px] text-indigo-400 font-medium">Mapel Pilihan</span>
              </div>
              <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700/60 text-center">
                <span className="text-xs text-slate-400 font-medium">Tingkat XII</span>
                <div className="text-2xl font-bold text-white mt-1">{kelasXII}</div>
                <span className="text-[11px] text-indigo-400 font-medium">Persiapan UTBK/SNBP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Web Service Architecture & System Info */}
        <div className="space-y-6">
          {/* Web Service Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              Integrasi Web Service Dapodik
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Komunikasi dua arah dengan server pusat Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/70">
                <div className="text-slate-400 text-[11px]">Protokol Sinkronisasi</div>
                <div className="text-white font-mono font-medium mt-0.5">REST API / JSON Web Service + SSE</div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/70">
                <div className="text-slate-400 text-[11px]">NPSN & Kode Registrasi</div>
                <div className="text-white font-mono font-medium mt-0.5">
                  {sekolah?.npsn || '20532189'} · Terverifikasi PD-Data
                </div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/70">
                <div className="text-slate-400 text-[11px]">Token Otorisasi Web Service</div>
                <div className="text-slate-300 font-mono text-[11px] truncate mt-0.5">
                  {sekolah?.apiToken || 'DPK-SEC-7749-X9-2026'}
                </div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/70">
                <div className="text-slate-400 text-[11px]">Interval Sinkronisasi Otomatis</div>
                <div className="text-emerald-400 font-medium mt-0.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Aktif (Setiap {sekolah?.autoSyncIntervalSec || 60} detik)
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800">
              <button
                onClick={() => onNavigateTab('api')}
                className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition text-center"
              >
                Konfigurasi Web Service & API Test
              </button>
            </div>
          </div>

          {/* School Profile Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-400" />
              Identitas Satuan Pendidikan
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/70">
                <span className="text-slate-400">Kepala Sekolah</span>
                <span className="text-white font-medium text-right">{sekolah?.kepalaSekolah}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/70">
                <span className="text-slate-400">NIP Kepala Sekolah</span>
                <span className="text-slate-300 font-mono text-right">{sekolah?.nipKepalaSekolah}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/70">
                <span className="text-slate-400">Akreditasi BAN-S/M</span>
                <span className="text-emerald-400 font-semibold">{sekolah?.akreditasi}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/70">
                <span className="text-slate-400">Kurikulum Operasional</span>
                <span className="text-slate-200">{sekolah?.kurikulum}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Wilayah / Cabang Dinas</span>
                <span className="text-slate-200">Wilayah Surabaya - Sidoarjo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
