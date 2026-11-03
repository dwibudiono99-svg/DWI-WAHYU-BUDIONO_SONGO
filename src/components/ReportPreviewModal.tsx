import React from 'react';
import { X, Printer, Download, FileSpreadsheet, FileText, CheckCircle2 } from 'lucide-react';
import { GTK, Siswa, SekolahInfo } from '../types/dapodik';
import { exportGtkPdf, exportSiswaPdf } from '../utils/pdfExport';
import { generateGtkExportCsv } from '../utils/gtkSpreadsheet';
import { generateDapodikExportCsv, generateDapodikSummaryCsv } from '../utils/dapodikSpreadsheet';

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: 'gtk' | 'siswa';
  sekolah: SekolahInfo | null;
  gtkData?: GTK[];
  siswaData?: Siswa[];
  filterInfo?: string;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  isOpen,
  onClose,
  reportType,
  sekolah,
  gtkData = [],
  siswaData = [],
  filterInfo = '',
}) => {
  if (!isOpen) return null;

  const schoolName = sekolah?.namaSekolah || 'SMAN 9 SURABAYA';
  const npsn = sekolah?.npsn || '20532189';
  const alamat = sekolah?.alamat || 'Jl. Wijaya Kusuma No. 48, Ketabang, Kec. Genteng, Kota Surabaya';
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleDownloadPdf = () => {
    if (reportType === 'gtk') {
      exportGtkPdf(gtkData, sekolah, filterInfo);
    } else {
      exportSiswaPdf(siswaData, sekolah, filterInfo);
    }
  };

  const handleDownloadCsv = () => {
    if (reportType === 'gtk') {
      const csv = '\uFEFF' + generateGtkExportCsv(gtkData, sekolah);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Laporan_GTK_Kepegawaian_${npsn}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const csv = '\uFEFF' + generateDapodikExportCsv(siswaData, sekolah);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Laporan_Dapodik_Siswa_${npsn}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto animate-in fade-in duration-150 print:p-0 print:bg-white print:static">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-4 max-h-[95vh] overflow-y-auto print:border-none print:shadow-none print:max-w-none print:w-full print:p-0 print:m-0 print:bg-white print:max-h-none print:overflow-visible">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3 print:hidden">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded uppercase">
                PRATINJAU CETAK & EKSPOR
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-300">
                {reportType === 'gtk' ? 'Laporan GTK / Kepegawaian' : 'Laporan Siswa / Dapodik'}
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">
              Pratinjau Dokumen Laporan Resmi Lokal
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-900/30 transition active:scale-95 cursor-pointer"
              title="Unduh berkas PDF (.pdf) langsung ke komputer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Unduh PDF</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-900/30 transition active:scale-95 cursor-pointer"
              title="Unduh berkas Excel/CSV (.csv)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Unduh CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition active:scale-95 cursor-pointer"
              title="Cetak langsung menggunakan dialog print browser"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak (Print)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 transition cursor-pointer"
              title="Tutup Pratinjau"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Paper (White Sheet) */}
        <div className="bg-white text-slate-900 rounded-xl p-6 sm:p-8 shadow-inner overflow-x-auto print:shadow-none print:p-0 print:rounded-none">
          {/* 1. Kop Surat Resmi */}
          <div className="text-center space-y-0.5 border-b-2 border-slate-900 pb-2 mb-4">
            <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
              PEMERINTAH PROVINSI JAWA TIMUR
            </div>
            <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
              DINAS PENDIDIKAN
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 uppercase tracking-tight">
              {schoolName}
            </h1>
            <p className="text-[10px] text-slate-600">
              {alamat} · NPSN: {npsn} · Akreditasi: A (Unggul)
            </p>
            <p className="text-[9px] text-slate-500">
              Website: sman9sby.sch.id · Email: smanixsurabaya@gmail.com · Telp: (031) 5342128
            </p>
            <div className="pt-1.5">
              <div className="h-[2px] bg-slate-900 w-full" />
              <div className="h-[0.5px] bg-slate-900 w-full mt-[1.5px]" />
            </div>
          </div>

          {/* 2. Judul Laporan */}
          <div className="text-center mb-4">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase underline tracking-wide">
              {reportType === 'gtk'
                ? 'LAPORAN DATA PENDIDIK DAN TENAGA KEPENDIDIKAN (GTK)'
                : 'LAPORAN DATA POKOK PESERTA DIDIK (DAPODIK)'}
            </h2>
            <p className="text-[11px] text-slate-600 mt-1">
              Tahun Ajaran: {sekolah?.semesterAktif || '2025/2026 Genap'} · Tanggal: {currentDate}
              {filterInfo && ` · Filter: ${filterInfo}`}
            </p>
          </div>

          {/* 3. Tabel Laporan */}
          {reportType === 'gtk' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px] border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                    <th className="py-2 px-1.5 border border-slate-300 text-center w-8">No</th>
                    <th className="py-2 px-2 border border-slate-300">Nama Lengkap & NIP</th>
                    <th className="py-2 px-1 border border-slate-300 text-center w-8">JK</th>
                    <th className="py-2 px-2 border border-slate-300">NUPTK</th>
                    <th className="py-2 px-2 border border-slate-300">Status Kepegawaian</th>
                    <th className="py-2 px-1.5 border border-slate-300 text-center">Gol</th>
                    <th className="py-2 px-2 border border-slate-300">Jabatan / PTK</th>
                    <th className="py-2 px-2 border border-slate-300">Bidang Studi</th>
                    <th className="py-2 px-1.5 border border-slate-300 text-center">Sertifikasi</th>
                    <th className="py-2 px-1.5 border border-slate-300 text-center">JJM</th>
                    <th className="py-2 px-2 border border-slate-300">No. HP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {gtkData.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-6 text-center text-slate-500 italic">
                        Tidak ada data GTK yang tersedia untuk dicetak.
                      </td>
                    </tr>
                  ) : (
                    gtkData.map((g, idx) => (
                      <tr key={g.id || idx} className={idx % 2 === 1 ? 'bg-slate-50' : ''}>
                        <td className="py-1.5 px-1.5 border border-slate-300 text-center font-mono">
                          {idx + 1}
                        </td>
                        <td className="py-1.5 px-2 border border-slate-300">
                          <div className="font-semibold text-slate-900">{g.nama}</div>
                          <div className="text-[9px] text-slate-600 font-mono">NIP: {g.nip || '-'}</div>
                        </td>
                        <td className="py-1.5 px-1 border border-slate-300 text-center font-bold">
                          {g.jenisKelamin || 'L'}
                        </td>
                        <td className="py-1.5 px-2 border border-slate-300 font-mono text-[9px]">
                          {g.nuptk || '-'}
                        </td>
                        <td className="py-1.5 px-2 border border-slate-300">{g.statusKepegawaian}</td>
                        <td className="py-1.5 px-1.5 border border-slate-300 text-center">
                          {g.pangkatGolongan || '-'}
                        </td>
                        <td className="py-1.5 px-2 border border-slate-300">{g.jenisPtk}</td>
                        <td className="py-1.5 px-2 border border-slate-300">{g.bidangStudi}</td>
                        <td className="py-1.5 px-1.5 border border-slate-300 text-center">
                          {g.statusSertifikasi === 'Sudah Bersertifikasi' ? 'Ya' : 'Belum'}
                        </td>
                        <td className="py-1.5 px-1.5 border border-slate-300 text-center font-semibold">
                          {g.jamMengajarPerMinggu || 0}
                        </td>
                        <td className="py-1.5 px-2 border border-slate-300 font-mono text-[9px]">
                          {g.noHp || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px] border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                    <th className="py-2 px-1.5 border border-slate-300 text-center w-8">No</th>
                    <th className="py-2 px-2 border border-slate-300">Nama Lengkap Siswa</th>
                    <th className="py-2 px-1.5 border border-slate-300 text-center">NIPD</th>
                    <th className="py-2 px-1 border border-slate-300 text-center w-8">JK</th>
                    <th className="py-2 px-2 border border-slate-300">NISN & NIK</th>
                    <th className="py-2 px-2 border border-slate-300">Tempat, Tanggal Lahir</th>
                    <th className="py-2 px-2 border border-slate-300 text-center">Rombel</th>
                    <th className="py-2 px-2 border border-slate-300">Nama Orang Tua</th>
                    <th className="py-2 px-1.5 border border-slate-300 text-center">Bantuan</th>
                    <th className="py-2 px-1.5 border border-slate-300 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {siswaData.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-6 text-center text-slate-500 italic">
                        Tidak ada data siswa yang tersedia untuk dicetak.
                      </td>
                    </tr>
                  ) : (
                    siswaData.map((s, idx) => (
                      <tr key={s.id || idx} className={idx % 2 === 1 ? 'bg-slate-50' : ''}>
                        <td className="py-1.5 px-1.5 border border-slate-300 text-center font-mono">
                          {idx + 1}
                        </td>
                        <td className="py-1.5 px-2 border border-slate-300 font-semibold text-slate-900">
                          {s.nama}
                        </td>
                        <td className="py-1.5 px-1.5 border border-slate-300 text-center font-mono text-[9px]">
                          {s.nipd || '-'}
                        </td>
                        <td className="py-1.5 px-1 border border-slate-300 text-center font-bold">
                          {s.jenisKelamin || 'L'}
                        </td>
                        <td className="py-1.5 px-2 border border-slate-300 font-mono text-[9px]">
                          <div>NISN: {s.nisn}</div>
                          <div className="text-slate-500">NIK: {s.nik}</div>
                        </td>
                        <td className="py-1.5 px-2 border border-slate-300">
                          {s.tempatLahir}, {s.tanggalLahir}
                        </td>
                        <td className="py-1.5 px-2 border border-slate-300 text-center font-medium">
                          {s.rombel}
                        </td>
                        <td className="py-1.5 px-2 border border-slate-300 text-[9px]">
                          <div>A: {s.namaAyah || '-'}</div>
                          <div className="text-slate-500">I: {s.namaIbu || '-'}</div>
                        </td>
                        <td className="py-1.5 px-1.5 border border-slate-300 text-center">
                          {s.penerimaKip === 'Ya' || s.layakPip === 'Ya' ? 'KIP/PIP' : 'Non-PIP'}
                        </td>
                        <td className="py-1.5 px-1.5 border border-slate-300 text-center font-medium">
                          {s.statusValidasiDapodik || 'Valid'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. Lembar Pengesahan / Tanda Tangan */}
          <div className="mt-8 pt-4 flex justify-between text-[11px] text-slate-800 break-inside-avoid">
            <div className="space-y-1">
              <p>Mengetahui,</p>
              <p className="font-semibold">Petugas Administrasi / SIM Kepegawaian</p>
              <div className="h-14" />
              <p className="font-bold underline text-slate-900">DWI WAHYU BUDIONO, S.Sos.</p>
              <p className="text-[10px] text-slate-600">NIP. - (Operator SIM Dapodik)</p>
            </div>

            <div className="space-y-1 text-right">
              <p>Surabaya, {currentDate}</p>
              <p className="font-semibold">Kepala SMAN 9 Surabaya</p>
              <div className="h-14" />
              <p className="font-bold underline text-slate-900">
                {sekolah?.kepalaSekolah || 'Drs. H. M. Sulaiman, M.Pd.'}
              </p>
              <p className="text-[10px] text-slate-600">
                NIP. {sekolah?.nipKepalaSekolah || '196705121992031005'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions (Hidden when printing) */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800 print:hidden">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Dokumen diformat siap cetak A4 Landscape dengan kop surat resmi Jawa Timur</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
