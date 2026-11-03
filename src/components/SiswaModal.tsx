import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, User, Home, BookOpen, CreditCard, Activity } from 'lucide-react';
import { Siswa } from '../types/dapodik';

interface SiswaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Siswa>) => Promise<void>;
  initialData: Siswa | null;
}

export const SiswaModal: React.FC<SiswaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [activeTab, setActiveTab] = useState<'identitas' | 'alamat' | 'ortu' | 'bantuan'>('identitas');

  const [formData, setFormData] = useState<Partial<Siswa>>({
    nama: '',
    nisn: '',
    nipd: '',
    nik: '',
    jenisKelamin: 'L',
    tingkatKelas: 'X',
    rombel: 'X-1 (Fase E)',
    jurusan: 'Fase E (Umum)',
    tempatLahir: 'Surabaya',
    tanggalLahir: '2009-01-01',
    agama: 'Islam',
    alamat: '',
    rt: '01',
    rw: '01',
    kelurahan: '',
    kecamatan: 'Genteng',
    kodePos: '60272',
    namaAyah: '',
    nikAyah: '',
    pekerjaanAyah: 'Wiraswasta',
    namaIbu: '',
    nikIbu: '',
    pekerjaanIbu: 'Ibu Rumah Tangga',
    namaWali: '',
    noHpOrtu: '',
    hp: '',
    statusSiswa: 'Aktif',
    statusValidasiDapodik: 'Valid',
    penerimaKip: 'Tidak',
    nomorKip: '',
    layakPip: 'Tidak',
    alasanLayakPip: '',
    bank: 'Bank Jatim',
    nomorRekeningBank: '',
    sekolahAsal: 'SMP Negeri',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        nama: '',
        nisn: '',
        nipd: '',
        nik: '',
        jenisKelamin: 'L',
        tingkatKelas: 'X',
        rombel: 'X-1 (Fase E)',
        jurusan: 'Fase E (Umum)',
        tempatLahir: 'Surabaya',
        tanggalLahir: '2009-01-01',
        agama: 'Islam',
        alamat: '',
        rt: '01',
        rw: '01',
        kelurahan: '',
        kecamatan: 'Genteng',
        kodePos: '60272',
        namaAyah: '',
        nikAyah: '',
        pekerjaanAyah: 'Wiraswasta',
        namaIbu: '',
        nikIbu: '',
        pekerjaanIbu: 'Ibu Rumah Tangga',
        namaWali: '',
        noHpOrtu: '',
        hp: '',
        statusSiswa: 'Aktif',
        statusValidasiDapodik: 'Valid',
        penerimaKip: 'Tidak',
        nomorKip: '',
        layakPip: 'Tidak',
        alasanLayakPip: '',
        bank: 'Bank Jatim',
        nomorRekeningBank: '',
        sekolahAsal: 'SMP Negeri',
      });
    }
    setError(null);
    setActiveTab('identitas');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama?.trim()) {
      setError('Nama lengkap peserta didik wajib diisi.');
      setActiveTab('identitas');
      return;
    }
    if (!formData.nisn?.trim()) {
      setError('NISN (10 digit) peserta didik wajib diisi.');
      setActiveTab('identitas');
      return;
    }
    if (!formData.nik?.trim()) {
      setError('NIK (16 digit) peserta didik wajib diisi.');
      setActiveTab('identitas');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan data siswa.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" />
              <span>{initialData ? 'Ubah Data Peserta Didik' : 'Tambah Peserta Didik Baru'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Standar pendataan peserta didik sesuai format resmi 66 kolom Dapodik Kemendikbud
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab selection in Form */}
        <div className="flex border-b border-slate-800 gap-2 mt-4 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('identitas')}
            className={`pb-2 px-3 font-semibold border-b-2 transition ${
              activeTab === 'identitas'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Identitas & Rombel
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('alamat')}
            className={`pb-2 px-3 font-semibold border-b-2 transition ${
              activeTab === 'alamat'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Alamat & Kontak
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ortu')}
            className={`pb-2 px-3 font-semibold border-b-2 transition ${
              activeTab === 'ortu'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Data Orang Tua
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bantuan')}
            className={`pb-2 px-3 font-semibold border-b-2 transition ${
              activeTab === 'bantuan'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            4. KIP / PIP & Sekolah
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* TAB 1: IDENTITAS & ROMBEL */}
          {activeTab === 'identitas' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Nama Lengkap Siswa <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama || ''}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Nama lengkap sesuai akta kelahiran..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  NISN (10 Digit) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  maxLength={10}
                  required
                  value={formData.nisn || ''}
                  onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                  placeholder="Contoh: 0081234567"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  NIPD (Nomor Induk Siswa Sekolah)
                </label>
                <input
                  type="text"
                  value={formData.nipd || ''}
                  onChange={(e) => setFormData({ ...formData, nipd: e.target.value })}
                  placeholder="Contoh: 24001"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  NIK Dukcapil (16 Digit) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  maxLength={16}
                  required
                  value={formData.nik || ''}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                  placeholder="Contoh: 3578012003070001"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Jenis Kelamin</label>
                <select
                  value={formData.jenisKelamin || 'L'}
                  onChange={(e) =>
                    setFormData({ ...formData, jenisKelamin: e.target.value as 'L' | 'P' })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Tempat Lahir</label>
                <input
                  type="text"
                  value={formData.tempatLahir || ''}
                  onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                  placeholder="Contoh: Surabaya"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Tanggal Lahir</label>
                <input
                  type="date"
                  value={formData.tanggalLahir || ''}
                  onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Agama</label>
                <select
                  value={formData.agama || 'Islam'}
                  onChange={(e) => setFormData({ ...formData, agama: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Islam">Islam</option>
                  <option value="Kristen Protestan">Kristen Protestan</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddha">Buddha</option>
                  <option value="Konghucu">Konghucu</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Tingkat Kelas</label>
                <select
                  value={formData.tingkatKelas || 'X'}
                  onChange={(e) => setFormData({ ...formData, tingkatKelas: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="X">Kelas X (Fase E)</option>
                  <option value="XI">Kelas XI (Fase F)</option>
                  <option value="XII">Kelas XII</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Rombel Saat Ini</label>
                <input
                  type="text"
                  value={formData.rombel || ''}
                  onChange={(e) => setFormData({ ...formData, rombel: e.target.value })}
                  placeholder="Contoh: X-1 (Fase E) atau XI MIPA 1"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Status Validasi Dapodik</label>
                <select
                  value={formData.statusValidasiDapodik || 'Valid'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      statusValidasiDapodik: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Valid">Valid Dukcapil & Pusdatin</option>
                  <option value="Warning">Warning (Catatan Dukcapil)</option>
                  <option value="Invalid">Invalid (Residu)</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 2: ALAMAT & KONTAK */}
          {activeTab === 'alamat' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-medium mb-1">Alamat Tempat Tinggal</label>
                <textarea
                  rows={2}
                  value={formData.alamat || ''}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  placeholder="Jalan, Gang, Nomor Rumah..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">RT / RW</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.rt || ''}
                    onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                    placeholder="RT: 01"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    value={formData.rw || ''}
                    onChange={(e) => setFormData({ ...formData, rw: e.target.value })}
                    placeholder="RW: 02"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Kelurahan / Desa</label>
                <input
                  type="text"
                  value={formData.kelurahan || ''}
                  onChange={(e) => setFormData({ ...formData, kelurahan: e.target.value })}
                  placeholder="Kelurahan..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Kecamatan</label>
                <input
                  type="text"
                  value={formData.kecamatan || ''}
                  onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                  placeholder="Kecamatan..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Kode Pos</label>
                <input
                  type="text"
                  value={formData.kodePos || ''}
                  onChange={(e) => setFormData({ ...formData, kodePos: e.target.value })}
                  placeholder="60272"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">No. HP / WhatsApp Siswa</label>
                <input
                  type="text"
                  value={formData.hp || ''}
                  onChange={(e) => setFormData({ ...formData, hp: e.target.value })}
                  placeholder="0812xxxxxxxx"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">No. HP / Kontak Orang Tua</label>
                <input
                  type="text"
                  value={formData.noHpOrtu || ''}
                  onChange={(e) => setFormData({ ...formData, noHpOrtu: e.target.value })}
                  placeholder="0813xxxxxxxx"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* TAB 3: DATA ORANG TUA */}
          {activeTab === 'ortu' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nama Ayah Kandung</label>
                <input
                  type="text"
                  value={formData.namaAyah || ''}
                  onChange={(e) => setFormData({ ...formData, namaAyah: e.target.value })}
                  placeholder="Nama ayah..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">NIK Ayah Kandung</label>
                <input
                  type="text"
                  maxLength={16}
                  value={formData.nikAyah || ''}
                  onChange={(e) => setFormData({ ...formData, nikAyah: e.target.value })}
                  placeholder="35780xxxxxxxxxxx"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Nama Ibu Kandung</label>
                <input
                  type="text"
                  value={formData.namaIbu || ''}
                  onChange={(e) => setFormData({ ...formData, namaIbu: e.target.value })}
                  placeholder="Nama ibu..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">NIK Ibu Kandung</label>
                <input
                  type="text"
                  maxLength={16}
                  value={formData.nikIbu || ''}
                  onChange={(e) => setFormData({ ...formData, nikIbu: e.target.value })}
                  placeholder="35780xxxxxxxxxxx"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Pekerjaan Ayah</label>
                <input
                  type="text"
                  value={formData.pekerjaanAyah || ''}
                  onChange={(e) => setFormData({ ...formData, pekerjaanAyah: e.target.value })}
                  placeholder="Wiraswasta / PNS / Karyawan..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Pekerjaan Ibu</label>
                <input
                  type="text"
                  value={formData.pekerjaanIbu || ''}
                  onChange={(e) => setFormData({ ...formData, pekerjaanIbu: e.target.value })}
                  placeholder="Ibu Rumah Tangga / Karyawan..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-medium mb-1">Nama Wali (Jika Tidak Bersama Orang Tua)</label>
                <input
                  type="text"
                  value={formData.namaWali || ''}
                  onChange={(e) => setFormData({ ...formData, namaWali: e.target.value })}
                  placeholder="Nama wali murid (opsional)..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* TAB 4: BANTUAN & SEKOLAH ASAL */}
          {activeTab === 'bantuan' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Penerima KIP (Kartu Indonesia Pintar)</label>
                <select
                  value={formData.penerimaKip || 'Tidak'}
                  onChange={(e) => setFormData({ ...formData, penerimaKip: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Tidak">Tidak</option>
                  <option value="Ya">Ya (Penerima Aktif)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Nomor KIP</label>
                <input
                  type="text"
                  value={formData.nomorKip || ''}
                  onChange={(e) => setFormData({ ...formData, nomorKip: e.target.value })}
                  placeholder="Nomor kartu KIP..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Layak PIP (Usulan Sekolah)</label>
                <select
                  value={formData.layakPip || 'Tidak'}
                  onChange={(e) => setFormData({ ...formData, layakPip: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Tidak">Tidak</option>
                  <option value="Ya">Ya (Layak Diusulkan PIP)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Alasan Layak PIP</label>
                <input
                  type="text"
                  value={formData.alasanLayakPip || ''}
                  onChange={(e) => setFormData({ ...formData, alasanLayakPip: e.target.value })}
                  placeholder="Pemegang PKH / KKS / Kurang Mampu..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Sekolah Asal (SMP/MTs)</label>
                <input
                  type="text"
                  value={formData.sekolahAsal || ''}
                  onChange={(e) => setFormData({ ...formData, sekolahAsal: e.target.value })}
                  placeholder="Contoh: SMP Negeri 1 Surabaya"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Bank Penyalur Bantuan</label>
                <input
                  type="text"
                  value={formData.bank || 'Bank Jatim'}
                  onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                  placeholder="Bank Jatim / BNI / BRI..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-900/30 transition active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Data Siswa'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
