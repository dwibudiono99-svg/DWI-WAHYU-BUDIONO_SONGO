import { SekolahInfo, GTK, Siswa, SyncLog } from '../types/dapodik';

const LOCAL_STORAGE_KEY = 'dapodik_sim_storage_v1';

const defaultData = {
  sekolah: {
    npsn: '20532189',
    namaSekolah: 'SMAN 9 SURABAYA',
    bentukPendidikan: 'SMA',
    statusSekolah: 'Negeri',
    alamat: 'Jl. Wijaya Kusuma No. 48, Ketabang, Kec. Genteng',
    kota: 'Kota Surabaya',
    provinsi: 'Jawa Timur',
    kodePos: '60272',
    akreditasi: 'A (Unggul)',
    kurikulum: 'Kurikulum Merdeka',
    semesterAktif: '2025/2026 Genap',
    kepalaSekolah: 'Drs. H. M. Sulaiman, M.Pd.',
    nipKepalaSekolah: '196705121992031005',
    lastSyncTime: null,
    apiEndpoint: 'https://dapodik.kemdikbud.go.id/rest/v1.4',
    apiToken: 'DPK-SEC-7749-X9-2026',
    autoSyncEnabled: true,
    autoSyncIntervalSec: 60,
  },
  gtk: [],
  siswa: [],
  syncLogs: []
};

// Safe Local Storage Reader & Writer
function getLocalCache() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // ignore
  }
  return defaultData;
}

function setLocalCache(data: any) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // ignore
  }
}

// Resilient Fetch wrapper
async function safeFetch<T>(url: string, options?: RequestInit, fallbackData?: T): Promise<T> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        ...(options?.headers || {}),
      },
    });

    clearTimeout(timeout);

    if (res.ok) {
      return (await res.json()) as T;
    }
  } catch (err) {
    // Gracefully caught: network offline, aborted, or server not ready
  }

  if (fallbackData !== undefined) {
    return fallbackData;
  }
  throw new Error('Gagal menghubungi server');
}

export const apiService = {
  async getSekolah(): Promise<SekolahInfo> {
    const cache = getLocalCache();
    const data = await safeFetch<SekolahInfo>('/api/sekolah', undefined, cache.sekolah);
    cache.sekolah = data;
    setLocalCache(cache);
    return data;
  },

  async updateSekolah(update: Partial<SekolahInfo>): Promise<SekolahInfo> {
    const cache = getLocalCache();
    cache.sekolah = { ...cache.sekolah, ...update };
    setLocalCache(cache);

    return safeFetch<SekolahInfo>(
      '/api/sekolah',
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      },
      cache.sekolah
    );
  },

  async getGtk(): Promise<GTK[]> {
    const cache = getLocalCache();
    const data = await safeFetch<GTK[]>('/api/gtk', undefined, cache.gtk);
    cache.gtk = data;
    setLocalCache(cache);
    return data;
  },

  async createGtk(item: Partial<GTK>): Promise<GTK> {
    const cache = getLocalCache();
    const newGtk: GTK = {
      id: `gtk-${Date.now()}`,
      syncStatus: 'pending_sync',
      lastSyncedAt: null,
      ...(item as any),
    };
    cache.gtk.unshift(newGtk);
    setLocalCache(cache);

    return safeFetch<GTK>(
      '/api/gtk',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      },
      newGtk
    );
  },

  async updateGtk(id: string, item: Partial<GTK>): Promise<GTK> {
    const cache = getLocalCache();
    const idx = cache.gtk.findIndex((g: any) => g.id === id);
    let updated: GTK = { ...cache.gtk[idx], ...item, syncStatus: 'pending_sync' };
    if (idx !== -1) {
      cache.gtk[idx] = updated;
      setLocalCache(cache);
    }

    return safeFetch<GTK>(
      `/api/gtk/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      },
      updated
    );
  },

  async deleteGtk(id: string): Promise<void> {
    const cache = getLocalCache();
    cache.gtk = cache.gtk.filter((g: any) => g.id !== id);
    setLocalCache(cache);

    await safeFetch<any>(`/api/gtk/${id}`, { method: 'DELETE' }, { ok: true });
  },

  async getSiswa(): Promise<Siswa[]> {
    const cache = getLocalCache();
    const data = await safeFetch<Siswa[]>('/api/siswa', undefined, cache.siswa);
    cache.siswa = data;
    setLocalCache(cache);
    return data;
  },

  async createSiswa(item: Partial<Siswa>): Promise<Siswa> {
    const cache = getLocalCache();
    const newSiswa: Siswa = {
      id: `sis-${Date.now()}`,
      statusValidasiDapodik: 'Valid',
      syncStatus: 'pending_sync',
      lastSyncedAt: null,
      ...(item as any),
    };
    cache.siswa.unshift(newSiswa);
    setLocalCache(cache);

    return safeFetch<Siswa>(
      '/api/siswa',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      },
      newSiswa
    );
  },

  async updateSiswa(id: string, item: Partial<Siswa>): Promise<Siswa> {
    const cache = getLocalCache();
    const idx = cache.siswa.findIndex((s: any) => s.id === id);
    let updated: Siswa = { ...cache.siswa[idx], ...item, syncStatus: 'pending_sync' };
    if (idx !== -1) {
      cache.siswa[idx] = updated;
      setLocalCache(cache);
    }

    return safeFetch<Siswa>(
      `/api/siswa/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      },
      updated
    );
  },

  async deleteSiswa(id: string): Promise<void> {
    const cache = getLocalCache();
    cache.siswa = cache.siswa.filter((s: any) => s.id !== id);
    setLocalCache(cache);

    await safeFetch<any>(`/api/siswa/${id}`, { method: 'DELETE' }, { ok: true });
  },

  async batchImportSiswa(
    items: Partial<Siswa>[],
    overwrite: boolean = true
  ): Promise<{ success: boolean; addedCount: number; updatedCount: number; totalCount: number }> {
    const cache = getLocalCache();
    const now = new Date().toISOString();
    let addedCount = 0;
    let updatedCount = 0;

    for (const item of items) {
      const existingIdx = cache.siswa.findIndex(
        (s: any) => (item.nisn && s.nisn === item.nisn) || (item.nik && s.nik === item.nik)
      );

      if (existingIdx !== -1) {
        if (overwrite) {
          cache.siswa[existingIdx] = {
            ...cache.siswa[existingIdx],
            ...item,
            syncStatus: 'synced',
            lastSyncedAt: now,
          };
          updatedCount++;
        }
      } else {
        const newRecord: Siswa = {
          id: item.id || `sis-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          nisn: item.nisn || '',
          nipd: item.nipd || '',
          nik: item.nik || '',
          nama: item.nama || '',
          jenisKelamin: item.jenisKelamin || 'L',
          tingkatKelas: item.tingkatKelas || 'X',
          rombel: item.rombel || 'X-1',
          jurusan: item.jurusan || 'Fase E',
          tempatLahir: item.tempatLahir || 'Surabaya',
          tanggalLahir: item.tanggalLahir || '2009-01-01',
          agama: item.agama || 'Islam',
          alamat: item.alamat || '',
          namaAyah: item.namaAyah || '',
          namaIbu: item.namaIbu || '',
          noHpOrtu: item.noHpOrtu || '',
          statusSiswa: item.statusSiswa || 'Aktif',
          statusValidasiDapodik: item.statusValidasiDapodik || 'Valid',
          syncStatus: 'synced',
          lastSyncedAt: now,
          ...item,
        };
        cache.siswa.unshift(newRecord);
        addedCount++;
      }
    }

    const log: SyncLog = {
      id: `log-${Date.now()}`,
      timestamp: now,
      type: 'IMPORT_DAPODIK',
      direction: 'PULL',
      status: 'SUCCESS',
      gtkCount: cache.gtk.length,
      siswaCount: cache.siswa.length,
      message: `Impor data Siswa dari Dapodik berhasil: ${addedCount} baru, ${updatedCount} diperbarui.`,
      durationMs: 380,
    };

    cache.syncLogs = [log, ...(cache.syncLogs || [])].slice(0, 50);
    setLocalCache(cache);

    return safeFetch<any>(
      '/api/siswa/batch-import',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, overwrite }),
      },
      {
        success: true,
        addedCount,
        updatedCount,
        totalCount: cache.siswa.length,
      }
    );
  },

  async getSyncLogs(): Promise<SyncLog[]> {
    const cache = getLocalCache();
    const data = await safeFetch<SyncLog[]>('/api/sync/logs', undefined, cache.syncLogs || []);
    cache.syncLogs = data;
    setLocalCache(cache);
    return data;
  },

  async triggerSync(mode: string = 'FULL_SYNC'): Promise<{
    success: boolean;
    gtkCount: number;
    siswaCount: number;
    log: SyncLog;
  }> {
    const cache = getLocalCache();
    const now = new Date().toISOString();

    cache.gtk = cache.gtk.map((g: any) => ({ ...g, syncStatus: 'synced', lastSyncedAt: now }));
    cache.siswa = cache.siswa.map((s: any) => ({ ...s, syncStatus: 'synced', lastSyncedAt: now }));
    cache.sekolah.lastSyncTime = now;

    const log: SyncLog = {
      id: `log-${Date.now()}`,
      timestamp: now,
      type: mode,
      direction: 'BIDIRECTIONAL',
      status: 'SUCCESS',
      gtkCount: cache.gtk.length,
      siswaCount: cache.siswa.length,
      message: `Sinkronisasi Web Service Dapodik selesai. ${cache.gtk.length} GTK dan ${cache.siswa.length} Siswa berhasil disinkronkan.`,
      durationMs: 820,
    };

    cache.syncLogs = [log, ...(cache.syncLogs || [])].slice(0, 50);
    setLocalCache(cache);

    return safeFetch<any>(
      '/api/dapodik/sync',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      },
      {
        success: true,
        gtkCount: cache.gtk.length,
        siswaCount: cache.siswa.length,
        log,
      }
    );
  },

  async simulatePush(target: 'gtk' | 'siswa'): Promise<{ message: string; data: any }> {
    const cache = getLocalCache();
    const now = new Date().toISOString();

    if (target === 'gtk') {
      const sampleNames = [
        'Drs. H. Miftahul Huda, M.Si.',
        'Wahyuni Tri Utami, S.Pd., M.Hum.',
        'Agus Setiawan, S.Pd.',
        'Novi Damayanti, S.Pd., Gr.',
      ];
      const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      const newGtk: GTK = {
        id: `gtk-ext-${Date.now()}`,
        nik: `35780${Math.floor(10000000000 + Math.random() * 90000000000)}`,
        nip: `19850101201501100${Math.floor(1 + Math.random() * 9)}`,
        nuptk: `89${Math.floor(10000000000000 + Math.random() * 90000000000000)}`,
        nama: randomName,
        jenisKelamin: 'L',
        tempatLahir: 'Surabaya',
        tanggalLahir: '1985-04-12',
        agama: 'Islam',
        statusKepegawaian: 'PNS',
        jenisPtk: 'Guru Mapel',
        pangkatGolongan: 'Penata (III/c)',
        skPengangkatan: '813.1/192/2024',
        tmtPengangkatan: '2015-01-01',
        pendidikanTerakhir: 'S1 Pendidikan',
        bidangStudi: 'Biologi / IPA',
        statusSertifikasi: 'Sudah Bersertifikasi',
        nomorSertifikatPendidik: `120532189${Math.floor(100 + Math.random() * 899)}`,
        jamMengajarPerMinggu: 24,
        noHp: '081233445577',
        email: `${randomName.toLowerCase().replace(/[^a-z]/g, '').slice(0, 10)}@sekolah.sch.id`,
        syncStatus: 'synced',
        lastSyncedAt: now,
      };

      cache.gtk.unshift(newGtk);
      setLocalCache(cache);

      return safeFetch<any>(
        '/api/dapodik/simulate-external-change',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target }),
        },
        {
          message: `Webhook Dapodik: Data GTK "${newGtk.nama}" otomatis tersinkron ke SIM Kepegawaian.`,
          data: newGtk,
        }
      );
    } else {
      const sampleSiswa = [
        'Zahra Aulia Putri',
        'Bagus Dwi Wicaksono',
        'Keisha Aurelia Ramadhani',
        'Galang Arya Pratama',
      ];
      const randomName = sampleSiswa[Math.floor(Math.random() * sampleSiswa.length)];
      const newSiswa: Siswa = {
        id: `sis-ext-${Date.now()}`,
        nisn: `00${Math.floor(80000000 + Math.random() * 19999999)}`,
        nipd: `${Math.floor(24000 + Math.random() * 999)}`,
        nik: `35780${Math.floor(10000000000 + Math.random() * 90000000000)}`,
        nama: randomName,
        jenisKelamin: 'P',
        tingkatKelas: 'X',
        rombel: 'X-3 (Fase E)',
        jurusan: 'Fase E (Umum)',
        tempatLahir: 'Surabaya',
        tanggalLahir: '2009-04-12',
        agama: 'Islam',
        alamat: 'Jl. Kutai No. 25, Wonokromo',
        namaAyah: 'Budi Santoso',
        namaIbu: 'Sri Rahayu',
        noHpOrtu: '081399887766',
        statusSiswa: 'Aktif',
        statusValidasiDapodik: 'Valid',
        syncStatus: 'synced',
        lastSyncedAt: now,
      };

      cache.siswa.unshift(newSiswa);
      setLocalCache(cache);

      return safeFetch<any>(
        '/api/dapodik/simulate-external-change',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target }),
        },
        {
          message: `Webhook Dapodik: Data Siswa "${newSiswa.nama}" (NISN: ${newSiswa.nisn}) tersinkron secara real-time.`,
          data: newSiswa,
        }
      );
    }
  },

  async resetDatabase(): Promise<void> {
    const cleanData = {
      ...defaultData,
      sekolah: { ...defaultData.sekolah },
      gtk: [],
      siswa: [],
      syncLogs: [],
    };
    setLocalCache(cleanData);
    await safeFetch<any>('/api/reset', { method: 'POST' }, { success: true });
  },
};
