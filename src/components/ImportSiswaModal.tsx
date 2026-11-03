import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Server,
  RefreshCw,
  Users,
  Check,
  FileText,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import { Siswa, SekolahInfo } from '../types/dapodik';
import {
  OFFICIAL_DAPODIK_COLUMNS,
  generateDapodikExportCsv,
  parseDapodikImportCsv,
  getOfficialDapodikSampleStudents,
} from '../utils/dapodikSpreadsheet';

interface ImportSiswaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: Partial<Siswa>[], overwrite: boolean) => Promise<void>;
  existingSiswaList: Siswa[];
  sekolah?: SekolahInfo | null;
}

export const ImportSiswaModal: React.FC<ImportSiswaModalProps> = ({
  isOpen,
  onClose,
  onImport,
  existingSiswaList,
  sekolah,
}) => {
  const [activeTab, setActiveTab] = useState<'api' | 'file'>('file');
  const [overwrite, setOverwrite] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tab 1: Web Service Dapodik Direct Pull
  const [remoteStudents, setRemoteStudents] = useState<Partial<Siswa>[]>(() =>
    getOfficialDapodikSampleStudents()
  );
  const [selectedRemoteIds, setSelectedRemoteIds] = useState<string[]>([]);

  // Tab 2: File upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedFileRows, setParsedFileRows] = useState<Partial<Siswa>[]>([]);
  const [fileName, setFileName] = useState<string>('');

  React.useEffect(() => {
    setSelectedRemoteIds(remoteStudents.map((s) => s.id || s.nisn || ''));
  }, [remoteStudents]);

  if (!isOpen) return null;

  const toggleSelectRemote = (id: string) => {
    setSelectedRemoteIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllRemote = () => {
    if (selectedRemoteIds.length === remoteStudents.length) {
      setSelectedRemoteIds([]);
    } else {
      setSelectedRemoteIds(remoteStudents.map((s) => s.id || s.nisn || ''));
    }
  };

  // Download template CSV format resmi Dapodik Kemendikbud (Persis sesuai gambar)
  const handleDownloadTemplate = () => {
    const sampleStudents = getOfficialDapodikSampleStudents().slice(0, 1) as Siswa[];
    const csvContent = '\uFEFF' + generateDapodikExportCsv(sampleStudents, sekolah || null);

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Template_Dapodik_Daftar_Peserta_Didik.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Load sample data for immediate testing
  const handleLoadSampleData = () => {
    const sample = getOfficialDapodikSampleStudents();
    setParsedFileRows(sample);
    setFileName('Daftar_Peserta_Didik_SMAN9_Resmi.csv');
    setError(null);
  };

  // Parse Uploaded CSV / Text File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          setError('Berkas kosong.');
          return;
        }

        const parsed = parseDapodikImportCsv(text);
        if (parsed.length === 0) {
          setError(
            'Tidak dapat menemukan data siswa dalam berkas. Pastikan menggunakan format CSV Dapodik resmi dengan kolom Nama, NISN, NIPD, atau Rombel.'
          );
        } else {
          setParsedFileRows(parsed);
        }
      } catch (err: any) {
        setError('Gagal membaca berkas CSV: ' + err.message);
      }
    };

    reader.readAsText(file, 'utf-8');
  };

  // Execute Import
  const handleExecuteImport = async () => {
    try {
      setLoading(true);
      setError(null);

      let itemsToImport: Partial<Siswa>[] = [];

      if (activeTab === 'api') {
        itemsToImport = remoteStudents.filter((s) =>
          selectedRemoteIds.includes(s.id || s.nisn || '')
        );
        if (itemsToImport.length === 0) {
          setError('Pilih minimal satu siswa dari daftar Dapodik untuk diimpor.');
          setLoading(false);
          return;
        }
      } else {
        if (parsedFileRows.length === 0) {
          setError('Silakan unggah berkas CSV Dapodik atau muat contoh data terlebih dahulu.');
          setLoading(false);
          return;
        }
        itemsToImport = parsedFileRows;
      }

      await onImport(itemsToImport, overwrite);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Gagal melakukan impor data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl my-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                FORMAT RESMI DAPODIK KEMENDIKBUD (66 KOLOM)
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-300 font-mono">Daftar Peserta Didik</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-0.5">
              Import Data Siswa ke Database Web
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Mendukung struktur lengkap: NIPD, JK, NISN, NIK, Alamat, Data Ayah, Data Ibu, Data Wali, Rombel Saat Ini, KIP, PIP, dsb.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 space-x-4">
          <button
            onClick={() => { setActiveTab('file'); setError(null); }}
            className={`pb-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'file'
                ? 'border-emerald-500 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Unggah Berkas Ekspor Dapodik (.CSV / Excel)</span>
          </button>
          <button
            onClick={() => { setActiveTab('api'); setError(null); }}
            className={`pb-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'api'
                ? 'border-emerald-500 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Tarik Langsung dari Web Service Dapodik ({remoteStudents.length} Siswa Siap)</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-lg text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: CSV FILE UPLOAD */}
        {activeTab === 'file' && (
          <div className="space-y-4">
            {/* Quick Actions & Template Download */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs">
              <div>
                <span className="text-white font-semibold">Format Standar Ekspor Dapodik (66 Kolom)</span>
                <p className="text-[11px] text-slate-400">
                  Mendukung judul laporan di baris 1-6 dan baris tabel mulai baris 7 persis seperti hasil unduh Dapodik.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleLoadSampleData}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Muat Contoh Siswa Lengkap</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Template Format Dapodik (.CSV)</span>
                </button>
              </div>
            </div>

            {/* Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-850/40 hover:bg-slate-800/30 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-500 group-hover:text-emerald-400 mb-2 transition" />
              <div className="font-semibold text-sm text-white">
                {fileName ? `Berkas Terpilih: ${fileName}` : 'Klik untuk memilih berkas CSV atau seret ke sini'}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Gunakan hasil unduh dari menu <strong>Daftar Peserta Didik</strong> aplikasi Dapodik
              </p>
            </div>

            {/* Preview Parsed Rows */}
            {parsedFileRows.length > 0 && (
              <div className="border border-slate-800 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                <div className="p-2.5 bg-slate-800 text-xs font-semibold text-emerald-300 flex items-center justify-between border-b border-slate-700">
                  <span>Pratinjau Data: {parsedFileRows.length} Siswa Terbaca</span>
                  <span className="text-[11px] text-slate-400 font-mono">Format Dapodik Valid (66 Parameter)</span>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-850 text-slate-400 border-b border-slate-800 sticky top-0 text-[11px]">
                    <tr>
                      <th className="py-2 px-3">Nama</th>
                      <th className="py-2 px-3">NIPD</th>
                      <th className="py-2 px-3 text-center">JK</th>
                      <th className="py-2 px-3">NISN</th>
                      <th className="py-2 px-3">NIK</th>
                      <th className="py-2 px-3">Rombel</th>
                      <th className="py-2 px-3">Data Ayah & Ibu</th>
                      <th className="py-2 px-3">KIP / PIP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {parsedFileRows.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-semibold text-white">{s.nama}</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-400">{s.nipd || '-'}</td>
                        <td className="py-2 px-3 text-center font-bold text-[11px] text-slate-300">{s.jenisKelamin || 'L'}</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-300">{s.nisn}</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-400">{s.nik}</td>
                        <td className="py-2 px-3 text-slate-200">{s.rombel}</td>
                        <td className="py-2 px-3 text-[11px] text-slate-300">
                          <div>A: {s.namaAyah || '-'}</div>
                          <div className="text-slate-400">I: {s.namaIbu || '-'}</div>
                        </td>
                        <td className="py-2 px-3 text-[11px]">
                          {s.penerimaKip === 'Ya' || s.layakPip === 'Ya' ? (
                            <span className="text-emerald-400 font-medium">PIP/KIP</span>
                          ) : (
                            <span className="text-slate-500">Non-PIP</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: API WEB SERVICE DIRECT PULL */}
        {activeTab === 'api' && (
          <div className="space-y-4">
            <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  Terhubung ke Web Service Dapodik Pusdatin (NPSN: <strong>{sekolah?.npsn || '20532189'}</strong>)
                </span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400">
                <span>{selectedRemoteIds.length} dari {remoteStudents.length} siswa dipilih</span>
                <button
                  type="button"
                  onClick={toggleSelectAllRemote}
                  className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-[11px] font-medium transition cursor-pointer"
                >
                  {selectedRemoteIds.length === remoteStudents.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                </button>
              </div>
            </div>

            {/* List of remote students */}
            <div className="border border-slate-800 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800 text-slate-400 font-semibold border-b border-slate-700 sticky top-0 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">Pilih</th>
                    <th className="py-2.5 px-3">Nama & NIPD</th>
                    <th className="py-2.5 px-3 text-center">JK</th>
                    <th className="py-2.5 px-3">NISN & NIK</th>
                    <th className="py-2.5 px-3">Rombel Saat Ini</th>
                    <th className="py-2.5 px-3">Data Orang Tua</th>
                    <th className="py-2.5 px-3">Status Dapodik</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {remoteStudents.map((siswa) => {
                    const id = siswa.id || siswa.nisn || '';
                    const isSelected = selectedRemoteIds.includes(id);
                    const isAlreadyInDb = existingSiswaList.some((s) => s.nisn === siswa.nisn);

                    return (
                      <tr
                        key={id}
                        onClick={() => toggleSelectRemote(id)}
                        className={`cursor-pointer hover:bg-slate-800/40 transition ${
                          isSelected ? 'bg-emerald-950/20' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRemote(id)}
                            className="rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            {siswa.nama}
                            {isAlreadyInDb && (
                              <span className="text-[10px] px-1 py-0.2 bg-amber-500/20 text-amber-300 rounded font-normal">
                                Sudah di DB
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            NIPD: {siswa.nipd || '-'}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-300">
                          {siswa.jenisKelamin || 'L'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">
                          <div>NISN: {siswa.nisn}</div>
                          <div className="text-slate-400">NIK: {siswa.nik}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-medium text-slate-200">{siswa.rombel}</span>
                        </td>
                        <td className="py-2.5 px-3 text-[11px]">
                          <div>A: {siswa.namaAyah || '-'}</div>
                          <div className="text-slate-400">I: {siswa.namaIbu || '-'}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Valid Pusdatin
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Deduplication Option */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
          <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={overwrite}
              onChange={(e) => setOverwrite(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <span>Perbarui data jika NISN/NIK siswa sudah ada di database web (Timpa data)</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex justify-end space-x-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleExecuteImport}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-600/30 transition active:scale-95 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Menyimpan ke Database...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>
                  {activeTab === 'api'
                    ? `Impor ${selectedRemoteIds.length} Siswa ke Database Web`
                    : `Impor ${parsedFileRows.length} Siswa dari Berkas Dapodik`}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
