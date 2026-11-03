import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Download,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Award,
  BookOpen,
  Briefcase,
  Mail,
  Phone,
  UserCheck,
  ChevronRight,
  ChevronDown,
  Users,
  FileText,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Info,
} from 'lucide-react';
import { GTK, SekolahInfo } from '../types/dapodik';
import { generateGtkExportCsv } from '../utils/gtkSpreadsheet';
import { exportGtkPdf } from '../utils/pdfExport';
import { ReportPreviewModal } from './ReportPreviewModal';

interface GtkManagementProps {
  gtkList: GTK[];
  sekolah?: SekolahInfo | null;
  onAddGtk: () => void;
  onEditGtk: (gtk: GTK) => void;
  onDeleteGtk: (id: string, nama: string) => void;
  onSyncGtkSingle: (gtk: GTK) => void;
}

export const GtkManagement: React.FC<GtkManagementProps> = ({
  gtkList,
  sekolah,
  onAddGtk,
  onEditGtk,
  onDeleteGtk,
  onSyncGtkSingle,
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterSertifikasi, setFilterSertifikasi] = useState<string>('ALL');
  const [selectedGtk, setSelectedGtk] = useState<GTK | null>(null);

  // Export menu dropdown & Report Preview Modal
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

  const filteredList = useMemo(() => {
    return gtkList.filter((item) => {
      const matchSearch =
        item.nama.toLowerCase().includes(search.toLowerCase()) ||
        item.nip.includes(search) ||
        item.nuptk.includes(search) ||
        item.bidangStudi.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        filterStatus === 'ALL' || item.statusKepegawaian === filterStatus;

      const matchSertifikasi =
        filterSertifikasi === 'ALL' || item.statusSertifikasi === filterSertifikasi;

      return matchSearch && matchStatus && matchSertifikasi;
    });
  }, [gtkList, search, filterStatus, filterSertifikasi]);

  // Statistics calculation for GTK
  const stats = useMemo(() => {
    const total = gtkList.length;
    const pnsCount = gtkList.filter((g) => g.statusKepegawaian === 'PNS').length;
    const pppkCount = gtkList.filter((g) => g.statusKepegawaian === 'PPPK').length;
    const honorerCount = gtkList.filter(
      (g) => g.statusKepegawaian.includes('Honorer') || g.statusKepegawaian.includes('GTT') || g.statusKepegawaian.includes('PTT')
    ).length;
    const sertifikasiCount = gtkList.filter(
      (g) => g.statusSertifikasi === 'Sudah Bersertifikasi'
    ).length;
    const totalJjm = gtkList.reduce((acc, curr) => acc + (curr.jamMengajarPerMinggu || 0), 0);

    return {
      total,
      pnsCount,
      pppkCount,
      honorerCount,
      sertifikasiCount,
      sertifikasiPct: total > 0 ? Math.round((sertifikasiCount / total) * 100) : 0,
      totalJjm,
    };
  }, [gtkList]);

  // 1. Download CSV
  const handleDownloadCsv = (scope: 'filtered' | 'all' = 'filtered') => {
    const targetData = scope === 'all' ? gtkList : filteredList;
    if (targetData.length === 0) {
      alert('Tidak ada data pegawai (GTK) untuk diekspor.');
      return;
    }
    const csvContent = '\uFEFF' + generateGtkExportCsv(targetData, sekolah || null);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Laporan_GTK_Kepegawaian_${sekolah?.npsn || '20532189'}_${timestamp}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // 2. Export to PDF (Direct download)
  const handleExportPdf = (scope: 'filtered' | 'all' = 'filtered') => {
    const targetData = scope === 'all' ? gtkList : filteredList;
    if (targetData.length === 0) {
      alert('Tidak ada data pegawai (GTK) untuk diekspor ke PDF.');
      return;
    }
    const filterDesc =
      scope === 'all'
        ? 'Seluruh Pegawai'
        : [
            filterStatus !== 'ALL' ? `Status: ${filterStatus}` : '',
            filterSertifikasi !== 'ALL' ? `Sertifikasi: ${filterSertifikasi}` : '',
          ]
            .filter(Boolean)
            .join(', ') || 'Semua Terpilih';

    exportGtkPdf(targetData, sekolah || null, filterDesc);
    setShowExportMenu(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold tracking-wider text-blue-400 bg-blue-950/60 border border-blue-500/30 px-2 py-0.5 rounded uppercase">
              SIM KEPEGAWAIAN SEKOLAH
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 font-mono">Pendidik & Tendik (GTK)</span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mt-1">
            Database Kepegawaian & GTK Dapodik
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {sekolah?.namaSekolah || 'SMAN 9 SURABAYA'} · NPSN: {sekolah?.npsn || '20532189'} · Pendidik dan Tenaga Kependidikan tersinkronisasi Server Dapodik
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Export to PDF Button */}
          <button
            onClick={() => handleExportPdf('filtered')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 bg-rose-600/90 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-950/30 border border-rose-500/40 transition active:scale-95 cursor-pointer"
            title="Download laporan GTK dalam format PDF resmi (.pdf)"
          >
            <FileText className="w-4 h-4" />
            <span>Export to PDF</span>
          </button>

          {/* Download CSV Button */}
          <button
            onClick={() => handleDownloadCsv('filtered')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/30 border border-emerald-500/40 transition active:scale-95 cursor-pointer"
            title="Download rekap data GTK ke berkas CSV/Excel (.csv)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download CSV</span>
          </button>

          {/* Export Menu Dropdown (More Options) */}
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
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-30 space-y-1 text-xs">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Laporan Lokal GTK
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
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white flex items-center gap-2.5 transition cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-rose-400" />
                  <div>
                    <div className="font-semibold text-white">Export Seluruh GTK (PDF)</div>
                    <div className="text-[10px] text-slate-400">Cetak semua ({gtkList.length}) tanpa filter</div>
                  </div>
                </button>

                <button
                  onClick={() => handleDownloadCsv('all')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white flex items-center gap-2.5 transition cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-white">Download Seluruh GTK (CSV)</div>
                    <div className="text-[10px] text-slate-400">22 kolom data lengkap Kemdikbud</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Add GTK Button */}
          <button
            onClick={onAddGtk}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-900/30 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Guru / Tendik</span>
          </button>
        </div>
      </div>

      {/* GTK Statistics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium">Total Personel GTK</div>
          <div className="text-xl font-bold text-white mt-0.5">{stats.total}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Guru & Tenaga Tendik</div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium">Pegawai PNS (ASN)</div>
          <div className="text-xl font-bold text-blue-400 mt-0.5">{stats.pnsCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Pegawai Negeri Sipil</div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium">Pegawai PPPK</div>
          <div className="text-xl font-bold text-teal-400 mt-0.5">{stats.pppkCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">PPPK Pemprov Jatim</div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium">GTT / Honorer</div>
          <div className="text-xl font-bold text-amber-400 mt-0.5">{stats.honorerCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Guru Tidak Tetap / PTT</div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium">Sertifikasi Pendidik</div>
          <div className="text-xl font-bold text-emerald-400 mt-0.5">{stats.sertifikasiCount}</div>
          <div className="text-[10px] text-emerald-500/80 mt-0.5">{stats.sertifikasiPct}% ber-Serdik</div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium">Total Beban Mengajar</div>
          <div className="text-xl font-bold text-indigo-400 mt-0.5">{stats.totalJjm}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Jam Mengajar / Minggu</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan nama, NIP, NUPTK, atau bidang studi..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Filter Status Kepegawaian */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Semua Status Kepegawaian</option>
              <option value="PNS">PNS (Pegawai Negeri Sipil)</option>
              <option value="PPPK">PPPK (P3K)</option>
              <option value="GTT / Honorer Sekolah">GTT / Honorer Sekolah</option>
              <option value="PTT / Tenaga Administrasi">PTT / Tenaga Administrasi</option>
            </select>
          </div>

          {/* Filter Sertifikasi */}
          <div>
            <select
              value={filterSertifikasi}
              onChange={(e) => setFilterSertifikasi(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Semua Sertifikasi</option>
              <option value="Sudah Bersertifikasi">Sudah Bersertifikasi</option>
              <option value="Belum Bersertifikasi">Belum Bersertifikasi</option>
              <option value="Bukan Guru">Bukan Guru (Tendik)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>
            Menampilkan <strong className="text-white">{filteredList.length}</strong> dari{' '}
            <strong className="text-white">{gtkList.length}</strong> pegawai
          </span>
          {(search || filterStatus !== 'ALL' || filterSertifikasi !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setFilterStatus('ALL');
                setFilterSertifikasi('ALL');
              }}
              className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800/80 text-slate-300 font-bold border-b border-slate-700 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Nama Lengkap & NIP</th>
                <th className="py-3.5 px-4">Status & Golongan</th>
                <th className="py-3.5 px-4">Jenis PTK / Mapel</th>
                <th className="py-3.5 px-4">Sertifikasi & JJM</th>
                <th className="py-3.5 px-4">Status Sync Dapodik</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-blue-400">
                        <Users className="w-7 h-7" />
                      </div>
                      <div className="font-bold text-sm text-slate-200">
                        {gtkList.length === 0
                          ? 'Database Kepegawaian Masih Kosong (0 Data)'
                          : 'Tidak ada pegawai yang sesuai dengan pencarian'}
                      </div>
                      <p className="text-xs text-slate-500">
                        {gtkList.length === 0
                          ? 'Belum ada data guru atau tenaga kependidikan terdaftar. Silakan tambahkan data pegawai baru untuk memulai.'
                          : 'Coba ubah kata kunci atau reset filter pencarian.'}
                      </p>
                      {gtkList.length === 0 && (
                        <button
                          onClick={onAddGtk}
                          className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Tambah Guru / Tendik Pertama</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((gtk) => {
                  const isPns = gtk.statusKepegawaian === 'PNS';
                  const isPppk = gtk.statusKepegawaian === 'PPPK';
                  const isSynced = gtk.syncStatus === 'synced';

                  return (
                    <tr
                      key={gtk.id}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                      onClick={() => setSelectedGtk(gtk)}
                    >
                      {/* Name & NIP */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white group-hover:text-blue-400 transition">
                          {gtk.nama}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5 space-x-2">
                          <span>NIP: {gtk.nip}</span>
                          <span>·</span>
                          <span>NUPTK: {gtk.nuptk}</span>
                        </div>
                      </td>

                      {/* Status Kepegawaian & Golongan */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              isPns
                                ? 'bg-blue-950/80 text-blue-300 border border-blue-500/30'
                                : isPppk
                                ? 'bg-teal-950/80 text-teal-300 border border-teal-500/30'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {gtk.statusKepegawaian}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {gtk.pangkatGolongan}
                        </div>
                      </td>

                      {/* PTK & Subject */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200">{gtk.jenisPtk}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-1">
                          <BookOpen className="w-3 h-3 text-slate-500" />
                          <span>{gtk.bidangStudi}</span>
                        </div>
                      </td>

                      {/* Sertifikasi & JJM */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1">
                          {gtk.statusSertifikasi === 'Sudah Bersertifikasi' ? (
                            <span className="inline-flex items-center text-emerald-400 text-[11px] font-semibold gap-1 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                              <Award className="w-3 h-3" /> Bersertifikasi
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Belum Serdik</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 font-mono">
                          {gtk.jamMengajarPerMinggu} Jam / Minggu
                        </div>
                      </td>

                      {/* Sync Status */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5">
                          {isSynced ? (
                            <span className="inline-flex items-center text-emerald-400 text-xs gap-1 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Tersinkron</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-amber-400 text-xs gap-1 font-medium">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Pending Sync</span>
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {gtk.lastSyncedAt
                            ? new Date(gtk.lastSyncedAt).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              }) + ' WIB'
                            : 'Belum pernah'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => onEditGtk(gtk)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                            title="Edit Data Pegawai"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteGtk(gtk.id, gtk.nama)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                            title="Hapus Pegawai"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Detail Slideout for GTK */}
      {selectedGtk && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  Profil Lengkap GTK Dapodik
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{selectedGtk.nama}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  NIP: {selectedGtk.nip} · NUPTK: {selectedGtk.nuptk}
                </p>
              </div>
              <button
                onClick={() => setSelectedGtk(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Status Kepegawaian</span>
                <p className="font-bold text-white mt-0.5">{selectedGtk.statusKepegawaian}</p>
              </div>
              <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Pangkat & Golongan Ruang</span>
                <p className="font-bold text-white mt-0.5">{selectedGtk.pangkatGolongan}</p>
              </div>
              <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Tugas Pokok / Jabatan</span>
                <p className="font-bold text-white mt-0.5">{selectedGtk.jenisPtk}</p>
              </div>
              <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Bidang Studi Sertifikasi</span>
                <p className="font-bold text-white mt-0.5">{selectedGtk.bidangStudi}</p>
              </div>
              <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Jam Mengajar Linier (JJM)</span>
                <p className="font-bold text-white mt-0.5">{selectedGtk.jamMengajarPerMinggu} Jam / Minggu</p>
              </div>
              <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">SK & TMT Pengangkatan</span>
                <p className="font-bold text-white mt-0.5 font-mono text-[11px] truncate">
                  {selectedGtk.skPengangkatan}
                </p>
              </div>
              <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Pendidikan Terakhir</span>
                <p className="font-bold text-white mt-0.5">{selectedGtk.pendidikanTerakhir}</p>
              </div>
              <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Nomor Sertifikat Pendidik</span>
                <p className="font-bold text-white mt-0.5 font-mono text-[11px]">
                  {selectedGtk.nomorSertifikatPendidik || '-'}
                </p>
              </div>
              <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Kontak HP / WA</span>
                <p className="font-bold text-white mt-0.5 font-mono text-[11px]">
                  {selectedGtk.noHp || '-'}
                </p>
              </div>
              <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Status Validasi Dapodik</span>
                <p className="font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Siap Ekspor SKTP
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2.5">
              <button
                onClick={() => {
                  const g = selectedGtk;
                  setSelectedGtk(null);
                  onEditGtk(g);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
              >
                Edit Data Pegawai
              </button>
              <button
                onClick={() => setSelectedGtk(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Report Print & PDF Preview Modal */}
      <ReportPreviewModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportType="gtk"
        sekolah={sekolah || null}
        gtkData={filteredList}
        filterInfo={
          filterStatus !== 'ALL' || filterSertifikasi !== 'ALL'
            ? [
                filterStatus !== 'ALL' ? `Status: ${filterStatus}` : '',
                filterSertifikasi !== 'ALL' ? `Sertifikasi: ${filterSertifikasi}` : '',
              ]
                .filter(Boolean)
                .join(', ')
            : 'Semua Status'
        }
      />
    </div>
  );
};
