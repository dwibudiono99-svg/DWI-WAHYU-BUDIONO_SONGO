import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Download,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  GraduationCap,
  MapPin,
  Phone,
  Upload,
  CreditCard,
  FileText,
  Building,
  Home,
  Check,
  RotateCcw,
  ChevronDown,
  Info,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';
import { Siswa, SekolahInfo } from '../types/dapodik';
import {
  generateDapodikExportCsv,
  generateDapodikSummaryCsv,
} from '../utils/dapodikSpreadsheet';
import { exportSiswaPdf } from '../utils/pdfExport';
import { ReportPreviewModal } from './ReportPreviewModal';

interface SiswaManagementProps {
  siswaList: Siswa[];
  sekolah?: SekolahInfo | null;
  onAddSiswa: () => void;
  onEditSiswa: (siswa: Siswa) => void;
  onDeleteSiswa: (id: string, nama: string) => void;
  onOpenImportModal: () => void;
  onResetZero?: () => void;
}

export const SiswaManagement: React.FC<SiswaManagementProps> = ({
  siswaList,
  sekolah,
  onAddSiswa,
  onEditSiswa,
  onDeleteSiswa,
  onOpenImportModal,
  onResetZero,
}) => {
  const [search, setSearch] = useState('');
  const [filterKelas, setFilterKelas] = useState<string>('ALL');
  const [filterJk, setFilterJk] = useState<string>('ALL');
  const [filterKip, setFilterKip] = useState<string>('ALL');
  const [filterValidasi, setFilterValidasi] = useState<string>('ALL');
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const [detailTab, setDetailTab] = useState<'identitas' | 'ortu' | 'akademik' | 'bantuan' | 'fisik'>('identitas');

  // Export menu dropdown state
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered List calculation
  const filteredList = useMemo(() => {
    return siswaList.filter((item) => {
      const matchSearch =
        item.nama.toLowerCase().includes(search.toLowerCase()) ||
        (item.nisn && item.nisn.includes(search)) ||
        (item.nipd && item.nipd.includes(search)) ||
        (item.nik && item.nik.includes(search)) ||
        (item.rombel && item.rombel.toLowerCase().includes(search.toLowerCase())) ||
        (item.namaAyah && item.namaAyah.toLowerCase().includes(search.toLowerCase())) ||
        (item.namaIbu && item.namaIbu.toLowerCase().includes(search.toLowerCase()));

      const matchKelas =
        filterKelas === 'ALL' ||
        (item.tingkatKelas && item.tingkatKelas === filterKelas) ||
        (item.rombel && item.rombel.startsWith(filterKelas));

      const matchJk = filterJk === 'ALL' || item.jenisKelamin === filterJk;

      const matchKip =
        filterKip === 'ALL' ||
        (filterKip === 'KIP' && (item.penerimaKip === 'Ya' || item.layakPip === 'Ya')) ||
        (filterKip === 'NON_KIP' && item.penerimaKip !== 'Ya' && item.layakPip !== 'Ya');

      const matchValidasi =
        filterValidasi === 'ALL' || item.statusValidasiDapodik === filterValidasi;

      return matchSearch && matchKelas && matchJk && matchKip && matchValidasi;
    });
  }, [siswaList, search, filterKelas, filterJk, filterKip, filterValidasi]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = siswaList.length;
    const lCount = siswaList.filter((s) => s.jenisKelamin === 'L').length;
    const pCount = siswaList.filter((s) => s.jenisKelamin === 'P').length;
    const validCount = siswaList.filter((s) => s.statusValidasiDapodik === 'Valid').length;
    const kipCount = siswaList.filter((s) => s.penerimaKip === 'Ya' || s.layakPip === 'Ya').length;
    const uniqueRombel = Array.from(new Set(siswaList.map((s) => s.rombel).filter(Boolean)));

    return {
      total,
      lCount,
      pCount,
      lPct: total > 0 ? Math.round((lCount / total) * 100) : 0,
      pPct: total > 0 ? Math.round((pCount / total) * 100) : 0,
      validCount,
      validPct: total > 0 ? Math.round((validCount / total) * 100) : 0,
      kipCount,
      rombelCount: uniqueRombel.length,
    };
  }, [siswaList]);

  // Export 1: Ekspor Resmi Format Dapodik Kemendikbud (66 Kolom Lengkap)
  const handleExportOfficialCsv = (scope: 'filtered' | 'all' = 'filtered') => {
    const targetData = scope === 'all' ? siswaList : filteredList;
    if (targetData.length === 0) {
      alert('Tidak ada data siswa untuk diekspor.');
      return;
    }
    const csvContent = '\uFEFF' + generateDapodikExportCsv(targetData, sekolah || null);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Daftar_Peserta_Didik_Dapodik_Resmi_${sekolah?.npsn || '20532189'}_${timestamp}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // Export 2: Ekspor Format Rekapitulasi Ringkas (.CSV)
  const handleExportSummaryCsv = (scope: 'filtered' | 'all' = 'filtered') => {
    const targetData = scope === 'all' ? siswaList : filteredList;
    if (targetData.length === 0) {
      alert('Tidak ada data siswa untuk diekspor.');
      return;
    }
    const csvContent = '\uFEFF' + generateDapodikSummaryCsv(targetData, sekolah || null);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Rekap_Data_Siswa_${sekolah?.npsn || '20532189'}_${timestamp}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // Unduh Template Format Resmi Dapodik Kemdikbud
  const handleDownloadTemplate = () => {
    const emptyOrSample: Siswa[] = [];
    const csvContent = '\uFEFF' + generateDapodikExportCsv(emptyOrSample, sekolah || null);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Template_Dapodik_Daftar_Peserta_Didik_Resmi.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // Export to PDF
  const handleExportPdf = (scope: 'filtered' | 'all' = 'filtered') => {
    const targetData = scope === 'all' ? siswaList : filteredList;
    if (targetData.length === 0) {
      alert('Tidak ada data siswa untuk diekspor ke PDF.');
      return;
    }
    const filterDesc =
      scope === 'all'
        ? 'Seluruh Peserta Didik'
        : [
            filterKelas !== 'ALL' ? `Kelas: ${filterKelas}` : '',
            filterJk !== 'ALL' ? `JK: ${filterJk}` : '',
            filterKip !== 'ALL' ? (filterKip === 'KIP' ? 'Penerima KIP/PIP' : 'Non-KIP') : '',
          ]
            .filter(Boolean)
            .join(', ') || 'Semua Terpilih';

    exportSiswaPdf(targetData, sekolah || null, filterDesc);
    setShowExportMenu(false);
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    filterKelas !== 'ALL' ||
    filterJk !== 'ALL' ||
    filterKip !== 'ALL' ||
    filterValidasi !== 'ALL';

  const resetAllFilters = () => {
    setSearch('');
    setFilterKelas('ALL');
    setFilterJk('ALL');
    setFilterKip('ALL');
    setFilterValidasi('ALL');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Dapodik School Meta */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded uppercase">
              DAPODIK KEMENDIKBUDRISTEK
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 font-mono">Daftar Peserta Didik</span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mt-1">
            Database Peserta Didik (Siswa)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {sekolah?.namaSekolah || 'SMAN 9 SURABAYA'} · NPSN: <span className="font-mono text-slate-300">{sekolah?.npsn || '20532189'}</span> · Semester: {sekolah?.semesterAktif || '2025/2026 Genap'} · {sekolah?.alamat || 'Kec. Genteng, Kota Surabaya'}
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tombol Import Utama dari Dapodik */}
          <button
            onClick={onOpenImportModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/30 border border-emerald-500/50 transition active:scale-95 cursor-pointer"
            title="Import Data Siswa dari Dapodik (Web Service Kemdikbud atau Berkas CSV/Excel)"
          >
            <Upload className="w-4 h-4" />
            <span>Import dari Dapodik</span>
          </button>

          {/* Export to PDF Button */}
          <button
            onClick={() => handleExportPdf('filtered')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 bg-rose-600/90 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-950/30 border border-rose-500/40 transition active:scale-95 cursor-pointer"
            title="Download laporan siswa dalam format PDF resmi (.pdf)"
          >
            <FileText className="w-4 h-4" />
            <span>Export to PDF</span>
          </button>

          {/* Download CSV Button */}
          <button
            onClick={() => handleExportOfficialCsv('filtered')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/30 border border-emerald-500/40 transition active:scale-95 cursor-pointer"
            title="Download rekap data siswa ke berkas CSV format resmi Dapodik (.csv)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download CSV</span>
          </button>

          {/* Export Dropdown Menu */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="inline-flex items-center space-x-1 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition cursor-pointer"
              title="Pilihan ekspor & cetak laporan"
            >
              <span>Laporan</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-30 space-y-1 text-xs">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Pilihan Laporan Siswa
                </div>

                <button
                  onClick={() => {
                    setIsReportModalOpen(true);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white flex items-center gap-2.5 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="font-semibold text-white">Pratinjau & Cetak Dokumen</div>
                    <div className="text-[10px] text-slate-400">Lihat kop surat & tanda tangan resmi</div>
                  </div>
                </button>

                <button
                  onClick={() => handleExportPdf('all')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white flex items-start gap-2.5 transition cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-white">Export Seluruh Siswa (PDF)</div>
                    <div className="text-[11px] text-slate-400">Cetak semua ({siswaList.length} siswa) tanpa filter</div>
                  </div>
                </button>

                <button
                  onClick={() => handleExportOfficialCsv('filtered')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white flex items-start gap-2.5 transition cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-white">Format Resmi Dapodik (.CSV)</div>
                    <div className="text-[11px] text-slate-400">
                      66 kolom lengkap dengan baris kop Dapodik ({filteredList.length} siswa)
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleExportOfficialCsv('all')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white flex items-start gap-2.5 transition cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-white">Format Resmi Seluruh Siswa ({siswaList.length})</div>
                    <div className="text-[11px] text-slate-400">
                      Ekspor semua siswa tanpa terpengaruh filter pencarian
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleExportSummaryCsv('filtered')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white flex items-start gap-2.5 transition cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-white">Format Rekap Ringkas (.CSV)</div>
                    <div className="text-[11px] text-slate-400">
                      Tabel ringkas: Nama, NISN, NIPD, JK, Rombel, Ortu, HP ({filteredList.length} siswa)
                    </div>
                  </div>
                </button>
                <div className="border-t border-slate-800 pt-1 mt-1">
                  <button
                    onClick={handleDownloadTemplate}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-emerald-300 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">Unduh Template Kosong Dapodik</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tombol Tambah Siswa */}
          <button
            onClick={onAddSiswa}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-900/30 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>

          {/* Tombol Kembalikan ke Nol Data jika ada data */}
          {siswaList.length > 0 && onResetZero && (
            <button
              onClick={onResetZero}
              className="inline-flex items-center space-x-1.5 px-3 py-2.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl text-xs font-medium border border-rose-800/40 transition active:scale-95 cursor-pointer"
              title="Hapus seluruh data siswa dummy dan kembalikan database ke 0 data"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Kosongkan (0 Data)</span>
            </button>
          )}
        </div>
      </div>

      {/* Dapodik Statistical Ribbon Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium">Total Peserta Didik</div>
          <div className="text-xl font-bold text-white mt-0.5">{stats.total}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Database Web Dapodik</div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium">Laki-laki (L)</div>
          <div className="text-xl font-bold text-blue-400 mt-0.5">{stats.lCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">{stats.lPct}% dari total siswa</div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium">Perempuan (P)</div>
          <div className="text-xl font-bold text-pink-400 mt-0.5">{stats.pCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">{stats.pPct}% dari total siswa</div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium">Valid Dukcapil</div>
          <div className="text-xl font-bold text-emerald-400 mt-0.5">{stats.validCount}</div>
          <div className="text-[10px] text-emerald-500/80 mt-0.5">{stats.validPct}% siap sinkron</div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium">Penerima KIP / PIP</div>
          <div className="text-xl font-bold text-amber-400 mt-0.5">{stats.kipCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Bantuan Pendidikan</div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium">Rombel Terdaftar</div>
          <div className="text-xl font-bold text-indigo-400 mt-0.5">{stats.rombelCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Rombongan Belajar</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama siswa, NISN, NIPD, NIK, Rombel, Ayah/Ibu..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Filter Tingkat Kelas */}
          <div className="lg:col-span-2">
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Semua Tingkat</option>
              <option value="X">Kelas X (Fase E)</option>
              <option value="XI">Kelas XI (Fase F)</option>
              <option value="XII">Kelas XII</option>
            </select>
          </div>

          {/* Filter Jenis Kelamin */}
          <div className="lg:col-span-2">
            <select
              value={filterJk}
              onChange={(e) => setFilterJk(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Semua Jenis Kelamin</option>
              <option value="L">Laki-laki (L)</option>
              <option value="P">Perempuan (P)</option>
            </select>
          </div>

          {/* Filter Bantuan KIP/PIP */}
          <div className="lg:col-span-2">
            <select
              value={filterKip}
              onChange={(e) => setFilterKip(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Semua Status KIP/PIP</option>
              <option value="KIP">Penerima KIP / PIP</option>
              <option value="NON_KIP">Bukan Penerima KIP</option>
            </select>
          </div>

          {/* Filter Status Validasi */}
          <div className="lg:col-span-2">
            <select
              value={filterValidasi}
              onChange={(e) => setFilterValidasi(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Semua Validasi</option>
              <option value="Valid">Valid Pusdatin</option>
              <option value="Warning">Warning (Catatan)</option>
              <option value="Invalid">Invalid (Residu)</option>
            </select>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <div>
            Menampilkan <strong className="text-white">{filteredList.length}</strong> dari{' '}
            <strong className="text-white">{siswaList.length}</strong> peserta didik terdaftar
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer transition flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Semua Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800/90 text-slate-300 font-bold border-b border-slate-700 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-3 w-12 text-center">No</th>
                <th className="py-3.5 px-4 min-w-[200px]">Nama Lengkap & NIPD</th>
                <th className="py-3.5 px-3 text-center">JK</th>
                <th className="py-3.5 px-4 min-w-[170px]">NISN & NIK</th>
                <th className="py-3.5 px-4 min-w-[160px]">Tempat, Tgl Lahir</th>
                <th className="py-3.5 px-4 min-w-[140px]">Rombel Saat Ini</th>
                <th className="py-3.5 px-4 min-w-[160px]">Data Orang Tua</th>
                <th className="py-3.5 px-4 text-center">KIP / PIP</th>
                <th className="py-3.5 px-4 text-center">Validasi Dapodik</th>
                <th className="py-3.5 px-4 text-right min-w-[100px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center">
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-indigo-400">
                        <GraduationCap className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-bold text-base text-white">
                          {siswaList.length === 0
                            ? 'Database Peserta Didik Masih Kosong (0 Data Siswa)'
                            : 'Tidak Ada Siswa Sesuai Pencarian'}
                        </div>
                        <p className="text-xs text-slate-400">
                          {siswaList.length === 0
                            ? 'Belum ada data siswa terdaftar di database web. Anda dapat mengimpor data langsung dari Dapodik (Web Service) atau mengunggah berkas ekspor resmi Dapodik Kemdikbud.'
                            : 'Coba ubah kata kunci pencarian atau reset filter yang sedang aktif.'}
                        </p>
                      </div>

                      {siswaList.length === 0 ? (
                        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                          <button
                            onClick={onOpenImportModal}
                            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/30 transition active:scale-95 cursor-pointer"
                          >
                            <Upload className="w-4 h-4" />
                            <span>Import Data dari Dapodik</span>
                          </button>
                          <button
                            onClick={handleDownloadTemplate}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                            <span>Unduh Template Format Dapodik</span>
                          </button>
                          <button
                            onClick={onAddSiswa}
                            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition active:scale-95 cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Siswa Manual</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={resetAllFilters}
                          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition active:scale-95 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset Filter</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((siswa, idx) => {
                  const isValid = siswa.statusValidasiDapodik === 'Valid';
                  const isWarning = siswa.statusValidasiDapodik === 'Warning';
                  const isKip = siswa.penerimaKip === 'Ya' || siswa.layakPip === 'Ya';

                  return (
                    <tr
                      key={siswa.id}
                      className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                      onClick={() => {
                        setSelectedSiswa(siswa);
                        setDetailTab('identitas');
                      }}
                    >
                      {/* 1. No */}
                      <td className="py-3 px-3 text-center text-slate-500 font-mono text-[11px]">
                        {idx + 1}
                      </td>

                      {/* 2. Nama Lengkap & NIPD */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white group-hover:text-indigo-400 transition">
                          {siswa.nama}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          NIPD: <span className="text-slate-300">{siswa.nipd || '-'}</span>
                        </div>
                      </td>

                      {/* 3. JK */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`font-bold text-[11px] px-2 py-0.5 rounded-md ${
                            siswa.jenisKelamin === 'L'
                              ? 'text-blue-300 bg-blue-950/60 border border-blue-500/30'
                              : 'text-pink-300 bg-pink-950/60 border border-pink-500/30'
                          }`}
                        >
                          {siswa.jenisKelamin || 'L'}
                        </span>
                      </td>

                      {/* 4. NISN & NIK */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div className="text-slate-200 font-semibold">NISN: {siswa.nisn}</div>
                        <div className="text-slate-400 mt-0.5">NIK: {siswa.nik}</div>
                      </td>

                      {/* 5. Tempat, Tanggal Lahir */}
                      <td className="py-3 px-4">
                        <div className="text-slate-200">{siswa.tempatLahir || '-'}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                          {siswa.tanggalLahir || '-'}
                        </div>
                      </td>

                      {/* 6. Rombel Saat Ini */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{siswa.rombel}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {siswa.jurusan || siswa.tingkatKelas || 'Fase E'}
                        </div>
                      </td>

                      {/* 7. Data Orang Tua */}
                      <td className="py-3 px-4 text-[11px]">
                        <div className="text-slate-200">
                          <span className="text-blue-400 font-semibold">Ayah:</span> {siswa.namaAyah || '-'}
                        </div>
                        <div className="text-slate-400 mt-0.5">
                          <span className="text-pink-400 font-semibold">Ibu:</span> {siswa.namaIbu || '-'}
                        </div>
                      </td>

                      {/* 8. KIP / PIP */}
                      <td className="py-3 px-4 text-center text-[11px]">
                        {isKip ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                            <CreditCard className="w-3 h-3" /> PIP/KIP
                          </span>
                        ) : (
                          <span className="text-slate-500">Non-PIP</span>
                        )}
                      </td>

                      {/* 9. Status Validasi Dapodik */}
                      <td className="py-3 px-4 text-center">
                        {isValid ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Valid</span>
                          </span>
                        ) : isWarning ? (
                          <span
                            className="inline-flex items-center gap-1 text-amber-400 font-semibold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20"
                            title={siswa.catatanValidasi}
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Warning</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-semibold bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/20">
                            Invalid
                          </span>
                        )}
                      </td>

                      {/* 10. Actions */}
                      <td
                        className="py-3 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => {
                              setSelectedSiswa(siswa);
                              setDetailTab('identitas');
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition"
                            title="Lihat Detail 66 Parameter Dapodik"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditSiswa(siswa)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                            title="Edit Data Siswa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteSiswa(siswa.id, siswa.nama)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                            title="Hapus Siswa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal (Menampilkan 66 Parameter Resmi Dapodik Lengkap) */}
      {selectedSiswa && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-5 my-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-950/60 border border-indigo-500/30 px-2 py-0.5 rounded">
                    DATA POKOK PESERTA DIDIK (DAPODIK)
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs text-slate-400 font-mono">66 Kolom Kemdikbud</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">{selectedSiswa.nama}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  NISN: <span className="text-indigo-300 font-bold">{selectedSiswa.nisn}</span> · NIPD: {selectedSiswa.nipd || '-'} · NIK: {selectedSiswa.nik} · Rombel: {selectedSiswa.rombel}
                </p>
              </div>
              <button
                onClick={() => setSelectedSiswa(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Navigation Tabs in Detail Modal */}
            <div className="flex flex-wrap border-b border-slate-800 gap-2 text-xs">
              <button
                onClick={() => setDetailTab('identitas')}
                className={`pb-2 px-3 font-semibold border-b-2 transition ${
                  detailTab === 'identitas'
                    ? 'border-indigo-500 text-indigo-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                1. Identitas & Tempat Tinggal
              </button>
              <button
                onClick={() => setDetailTab('ortu')}
                className={`pb-2 px-3 font-semibold border-b-2 transition ${
                  detailTab === 'ortu'
                    ? 'border-indigo-500 text-indigo-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                2. Orang Tua & Wali
              </button>
              <button
                onClick={() => setDetailTab('akademik')}
                className={`pb-2 px-3 font-semibold border-b-2 transition ${
                  detailTab === 'akademik'
                    ? 'border-indigo-500 text-indigo-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                3. Registrasi & Riwayat
              </button>
              <button
                onClick={() => setDetailTab('bantuan')}
                className={`pb-2 px-3 font-semibold border-b-2 transition ${
                  detailTab === 'bantuan'
                    ? 'border-indigo-500 text-indigo-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                4. KIP, PIP & Bank
              </button>
              <button
                onClick={() => setDetailTab('fisik')}
                className={`pb-2 px-3 font-semibold border-b-2 transition ${
                  detailTab === 'fisik'
                    ? 'border-indigo-500 text-indigo-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                5. Data Periodik & Fisik
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="space-y-4 text-xs">
              {detailTab === 'identitas' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-850 p-4 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-400">Nama Lengkap:</span>
                    <p className="text-white font-bold">{selectedSiswa.nama}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Jenis Kelamin:</span>
                    <p className="text-white font-medium">{selectedSiswa.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Agama:</span>
                    <p className="text-white font-medium">{selectedSiswa.agama || 'Islam'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Tempat, Tanggal Lahir:</span>
                    <p className="text-white font-medium">{selectedSiswa.tempatLahir}, {selectedSiswa.tanggalLahir}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">NIK Siswa:</span>
                    <p className="text-white font-mono">{selectedSiswa.nik}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">No. Kartu Keluarga (KK):</span>
                    <p className="text-white font-mono">{selectedSiswa.noKk || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">No. Registrasi Akta Lahir:</span>
                    <p className="text-white font-mono">{selectedSiswa.noRegAktaLahir || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">RT / RW / Dusun:</span>
                    <p className="text-white">{selectedSiswa.rt || '-'}/{selectedSiswa.rw || '-'} {selectedSiswa.dusun || ''}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Kelurahan / Kecamatan:</span>
                    <p className="text-white">{selectedSiswa.kelurahan || '-'} / {selectedSiswa.kecamatan || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Kode Pos:</span>
                    <p className="text-white font-mono">{selectedSiswa.kodePos || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Jenis Tinggal:</span>
                    <p className="text-white">{selectedSiswa.jenisTinggal || 'Bersama orang tua'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Alat Transportasi:</span>
                    <p className="text-white">{selectedSiswa.alatTransportasi || 'Sepeda Motor'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400">Alamat Lengkap:</span>
                    <p className="text-white">{selectedSiswa.alamat || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Nomor Telepon / HP:</span>
                    <p className="text-white font-mono">{selectedSiswa.hp || selectedSiswa.noHpOrtu || '-'}</p>
                  </div>
                </div>
              )}

              {detailTab === 'ortu' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Ayah */}
                  <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <div className="text-blue-400 font-bold flex items-center gap-1.5 border-b border-slate-700/60 pb-1.5">
                      <User className="w-3.5 h-3.5" /> Data Ayah Kandung
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Nama Ayah:</span>
                      <p className="text-white font-bold">{selectedSiswa.namaAyah || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">NIK Ayah:</span>
                      <p className="text-white font-mono">{selectedSiswa.nikAyah || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Tahun Lahir / Pendidikan:</span>
                      <p className="text-white">{selectedSiswa.tahunLahirAyah || '-'} · {selectedSiswa.jenjangPendidikanAyah || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Pekerjaan:</span>
                      <p className="text-white">{selectedSiswa.pekerjaanAyah || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Penghasilan Bulanan:</span>
                      <p className="text-white">{selectedSiswa.penghasilanAyah || '-'}</p>
                    </div>
                  </div>

                  {/* Ibu */}
                  <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <div className="text-pink-400 font-bold flex items-center gap-1.5 border-b border-slate-700/60 pb-1.5">
                      <User className="w-3.5 h-3.5" /> Data Ibu Kandung
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Nama Ibu:</span>
                      <p className="text-white font-bold">{selectedSiswa.namaIbu || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">NIK Ibu:</span>
                      <p className="text-white font-mono">{selectedSiswa.nikIbu || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Tahun Lahir / Pendidikan:</span>
                      <p className="text-white">{selectedSiswa.tahunLahirIbu || '-'} · {selectedSiswa.jenjangPendidikanIbu || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Pekerjaan:</span>
                      <p className="text-white">{selectedSiswa.pekerjaanIbu || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Penghasilan Bulanan:</span>
                      <p className="text-white">{selectedSiswa.penghasilanIbu || '-'}</p>
                    </div>
                  </div>

                  {/* Wali */}
                  <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <div className="text-slate-300 font-bold flex items-center gap-1.5 border-b border-slate-700/60 pb-1.5">
                      <User className="w-3.5 h-3.5" /> Data Wali (Jika Ada)
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Nama Wali:</span>
                      <p className="text-white font-semibold">{selectedSiswa.namaWali || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">NIK Wali:</span>
                      <p className="text-white font-mono">{selectedSiswa.nikWali || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Pendidikan / Pekerjaan:</span>
                      <p className="text-white">{selectedSiswa.jenjangPendidikanWali || '-'} · {selectedSiswa.pekerjaanWali || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Penghasilan Wali:</span>
                      <p className="text-white">{selectedSiswa.penghasilanWali || '-'}</p>
                    </div>
                  </div>
                </div>
              )}

              {detailTab === 'akademik' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-850 p-4 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-400">Rombel Saat Ini:</span>
                    <p className="text-white font-bold">{selectedSiswa.rombel}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Tingkat Kelas:</span>
                    <p className="text-white font-medium">{selectedSiswa.tingkatKelas || 'Kelas X'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Jurusan / Peminatan:</span>
                    <p className="text-white font-medium">{selectedSiswa.jurusan || 'Fase E'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">NIPD (Nomor Induk):</span>
                    <p className="text-white font-mono">{selectedSiswa.nipd || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">No. Peserta Ujian Nasional:</span>
                    <p className="text-white font-mono">{selectedSiswa.noPesertaUn || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">No. Seri Ijazah SMP:</span>
                    <p className="text-white font-mono">{selectedSiswa.noSeriIjazah || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">SKHUN:</span>
                    <p className="text-white font-mono">{selectedSiswa.skhun || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Sekolah Asal:</span>
                    <p className="text-white">{selectedSiswa.sekolahAsal || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Status Keaktifan:</span>
                    <p className="text-emerald-400 font-bold">{selectedSiswa.statusSiswa || 'Aktif'}</p>
                  </div>
                </div>
              )}

              {detailTab === 'bantuan' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-850 p-4 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-400">Penerima KIP:</span>
                    <p className="text-white font-bold">{selectedSiswa.penerimaKip || 'Tidak'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Nomor KIP:</span>
                    <p className="text-white font-mono">{selectedSiswa.nomorKip || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Nama di KIP:</span>
                    <p className="text-white">{selectedSiswa.namaDiKip || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Nomor KKS:</span>
                    <p className="text-white font-mono">{selectedSiswa.nomorKks || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Layak PIP (Usulan Sekolah):</span>
                    <p className="text-white font-bold">{selectedSiswa.layakPip || 'Tidak'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Alasan Layak PIP:</span>
                    <p className="text-white">{selectedSiswa.alasanLayakPip || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Bank Penyalur:</span>
                    <p className="text-white font-medium">{selectedSiswa.bank || 'Bank Jatim'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Nomor Rekening Bank:</span>
                    <p className="text-white font-mono">{selectedSiswa.nomorRekeningBank || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Rekening Atas Nama:</span>
                    <p className="text-white">{selectedSiswa.rekeningAtasNama || '-'}</p>
                  </div>
                </div>
              )}

              {detailTab === 'fisik' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-850 p-4 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-400">Tinggi Badan:</span>
                    <p className="text-white font-semibold">{selectedSiswa.tinggiBadan ? `${selectedSiswa.tinggiBadan} cm` : '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Berat Badan:</span>
                    <p className="text-white font-semibold">{selectedSiswa.beratBadan ? `${selectedSiswa.beratBadan} kg` : '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Lingkar Kepala:</span>
                    <p className="text-white font-semibold">{selectedSiswa.lingkarKepala ? `${selectedSiswa.lingkarKepala} cm` : '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Anak Ke-berapa:</span>
                    <p className="text-white font-semibold">{selectedSiswa.anakKe || 1}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Jumlah Saudara Kandung:</span>
                    <p className="text-white font-semibold">{selectedSiswa.jmlSaudaraKandung || 0}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Jarak Rumah ke Sekolah:</span>
                    <p className="text-white">{selectedSiswa.jarakRumahKeSekolah || 'Kurang dari 5 km'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Koordinat Lintang (Latitude):</span>
                    <p className="text-white font-mono">{selectedSiswa.lintang || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Koordinat Bujur (Longitude):</span>
                    <p className="text-white font-mono">{selectedSiswa.bujur || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Kebutuhan Khusus:</span>
                    <p className="text-white">{selectedSiswa.kebutuhanKhusus || 'Tidak ada'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="text-[11px] text-slate-500">
                Terakhir disinkronkan: {selectedSiswa.lastSyncedAt ? new Date(selectedSiswa.lastSyncedAt).toLocaleString('id-ID') : 'Belum pernah'}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const toEdit = selectedSiswa;
                    setSelectedSiswa(null);
                    onEditSiswa(toEdit);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                >
                  Ubah Data Siswa
                </button>
                <button
                  onClick={() => setSelectedSiswa(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Report Print & PDF Preview Modal */}
      <ReportPreviewModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportType="siswa"
        sekolah={sekolah || null}
        siswaData={filteredList}
        filterInfo={
          filterKelas !== 'ALL' || filterJk !== 'ALL' || filterKip !== 'ALL' || filterValidasi !== 'ALL'
            ? [
                filterKelas !== 'ALL' ? `Kelas: ${filterKelas}` : '',
                filterJk !== 'ALL' ? `JK: ${filterJk}` : '',
                filterKip !== 'ALL' ? (filterKip === 'KIP' ? 'KIP/PIP' : 'Non-KIP') : '',
                filterValidasi !== 'ALL' ? `Status: ${filterValidasi}` : '',
              ]
                .filter(Boolean)
                .join(', ')
            : 'Semua Siswa Terdaftar'
        }
      />
    </div>
  );
};
