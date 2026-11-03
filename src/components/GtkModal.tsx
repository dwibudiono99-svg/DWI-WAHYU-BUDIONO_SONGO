import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { GTK, StatusKepegawaian } from '../types/dapodik';

interface GtkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<GTK>) => Promise<void>;
  initialData: GTK | null;
}

export const GtkModal: React.FC<GtkModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<Partial<GTK>>({
    nama: '',
    nik: '',
    nip: '',
    nuptk: '',
    jenisKelamin: 'L',
    tempatLahir: '',
    tanggalLahir: '1985-01-01',
    agama: 'Islam',
    statusKepegawaian: 'PNS',
    jenisPtk: 'Guru Mapel',
    pangkatGolongan: 'Penata (III/c)',
    skPengangkatan: '',
    tmtPengangkatan: '2015-01-01',
    pendidikanTerakhir: 'S1 Pendidikan',
    bidangStudi: '',
    statusSertifikasi: 'Sudah Bersertifikasi',
    nomorSertifikatPendidik: '',
    jamMengajarPerMinggu: 24,
    noHp: '',
    email: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        nama: '',
        nik: '',
        nip: '',
        nuptk: '',
        jenisKelamin: 'L',
        tempatLahir: 'Surabaya',
        tanggalLahir: '1985-01-01',
        agama: 'Islam',
        statusKepegawaian: 'PNS',
        jenisPtk: 'Guru Mapel',
        pangkatGolongan: 'Penata (III/c)',
        skPengangkatan: '813.2/045/2020',
        tmtPengangkatan: '2020-01-01',
        pendidikanTerakhir: 'S1 Pendidikan',
        bidangStudi: '',
        statusSertifikasi: 'Sudah Bersertifikasi',
        nomorSertifikatPendidik: '',
        jamMengajarPerMinggu: 24,
        noHp: '',
        email: '',
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.nik) {
      setError('Nama lengkap dan NIK wajib diisi.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan data pegawai.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white">
              {initialData ? 'Ubah Data Pegawai (GTK)' : 'Tambah Pendidik / Tendik Baru'}
            </h3>
            <p className="text-xs text-slate-400">
              Data akan dicatat di SIM Kepegawaian dan disiapkan untuk Web Service Dapodik
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-950/60 border border-rose-500/40 rounded-lg text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Nama Lengkap */}
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">
                Nama Lengkap dan Gelar <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nama || ''}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                placeholder="Contoh: Dra. Sri Wahyuni, M.Pd."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* NIK */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                NIK (16 Digit) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                maxLength={16}
                required
                value={formData.nik || ''}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                placeholder="Contoh: 3578011205670001"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* NIP */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                NIP (18 Digit / '-' jika Non-ASN)
              </label>
              <input
                type="text"
                value={formData.nip || ''}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                placeholder="Contoh: 197508152002122003"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* NUPTK */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                NUPTK (16 Digit / '-' jika belum ada)
              </label>
              <input
                type="text"
                value={formData.nuptk || ''}
                onChange={(e) => setFormData({ ...formData, nuptk: e.target.value })}
                placeholder="Contoh: 8456753655300022"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Jenis Kelamin */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Jenis Kelamin</label>
              <select
                value={formData.jenisKelamin || 'L'}
                onChange={(e) =>
                  setFormData({ ...formData, jenisKelamin: e.target.value as 'L' | 'P' })
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>

            {/* Status Kepegawaian */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Status Kepegawaian
              </label>
              <select
                value={formData.statusKepegawaian || 'PNS'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    statusKepegawaian: e.target.value as StatusKepegawaian,
                  })
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="PNS">PNS (Pegawai Negeri Sipil)</option>
                <option value="PPPK">PPPK (Pegawai Pemerintah PK)</option>
                <option value="GTT / Honorer Sekolah">GTT / Honorer Sekolah</option>
                <option value="PTT / Tenaga Administrasi">PTT / Tenaga Administrasi</option>
              </select>
            </div>

            {/* Pangkat & Golongan */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Pangkat & Golongan</label>
              <input
                type="text"
                value={formData.pangkatGolongan || ''}
                onChange={(e) => setFormData({ ...formData, pangkatGolongan: e.target.value })}
                placeholder="Contoh: Penata Tk.I (III/d) atau Ahli Pertama (IX)"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Jenis PTK */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Tugas Pokok (Jenis PTK)</label>
              <select
                value={formData.jenisPtk || 'Guru Mapel'}
                onChange={(e) => setFormData({ ...formData, jenisPtk: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Kepala Sekolah">Kepala Sekolah</option>
                <option value="Guru Mapel">Guru Mata Pelajaran</option>
                <option value="Guru BK">Guru Bimbingan Konseling (BK)</option>
                <option value="Tenaga Administrasi Sekolah">Tenaga Administrasi Sekolah</option>
                <option value="Laboran">Laboran</option>
                <option value="Pustakawan">Pustakawan</option>
              </select>
            </div>

            {/* Bidang Studi / Mapel */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Bidang Studi / Mata Pelajaran
              </label>
              <input
                type="text"
                value={formData.bidangStudi || ''}
                onChange={(e) => setFormData({ ...formData, bidangStudi: e.target.value })}
                placeholder="Contoh: Matematika, Fisika, Biologi"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Status Sertifikasi */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Sertifikasi Pendidik</label>
              <select
                value={formData.statusSertifikasi || 'Sudah Bersertifikasi'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    statusSertifikasi: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Sudah Bersertifikasi">Sudah Bersertifikasi</option>
                <option value="Belum Bersertifikasi">Belum Bersertifikasi</option>
                <option value="Bukan Guru">Bukan Guru (Tendik)</option>
              </select>
            </div>

            {/* Jam Mengajar (JJM) */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Jam Mengajar Per Minggu (JJM)
              </label>
              <input
                type="number"
                min={0}
                max={48}
                value={formData.jamMengajarPerMinggu ?? 24}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    jamMengajarPerMinggu: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* No HP */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Nomor WhatsApp / HP</label>
              <input
                type="text"
                value={formData.noHp || ''}
                onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                placeholder="Contoh: 081234567890"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Email Dinas / Akun Belajar.id</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="nama@guru.sman9sby.sch.id"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Data Pegawai'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
