import express from 'express';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DB_PATH = path.join(__dirname, 'data', 'dapodik_db.json');

// Ensure data folder exists
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

// Initial data with zero records (clean slate)
const initialData = {
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

// Database helper functions
function loadData() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading db file, falling back to initial data', err);
  }
  saveData(initialData);
  return initialData;
}

function saveData(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing db file', err);
  }
}

let db = loadData();

// Real-time SSE subscribers
const sseClients: Array<express.Response> = [];

function broadcastEvent(type: string, payload: any) {
  const message = `event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(message);
    } catch (e) {
      // client disconnected
    }
  });
}

async function start() {
  const app = express();
  const server = http.createServer(app);

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  app.use(express.json());

  // SSE Endpoint for real-time synchronization updates
  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    sseClients.push(res);

    // Initial ping
    res.write(`event: connected\ndata: ${JSON.stringify({ time: new Date().toISOString() })}\n\n`);

    req.on('close', () => {
      const index = sseClients.indexOf(res);
      if (index !== -1) {
        sseClients.splice(index, 1);
      }
    });
  });

  // API: Get Sekolah / Profil & Config
  app.get('/api/sekolah', (req, res) => {
    res.json(db.sekolah);
  });

  app.put('/api/sekolah', (req, res) => {
    db.sekolah = { ...db.sekolah, ...req.body };
    saveData(db);
    broadcastEvent('sekolah_updated', db.sekolah);
    res.json(db.sekolah);
  });

  // API: GTK (Guru & Tenaga Kependidikan / Kepegawaian)
  app.get('/api/gtk', (req, res) => {
    res.json(db.gtk);
  });

  app.post('/api/gtk', (req, res) => {
    const newGtk = {
      id: `gtk-${Date.now()}`,
      syncStatus: 'pending_sync',
      lastSyncedAt: null,
      ...req.body,
    };
    db.gtk.unshift(newGtk);
    saveData(db);
    broadcastEvent('gtk_created', newGtk);
    res.status(201).json(newGtk);
  });

  app.put('/api/gtk/:id', (req, res) => {
    const { id } = req.params;
    const index = db.gtk.findIndex((g: any) => g.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Data GTK tidak ditemukan' });
    }
    db.gtk[index] = {
      ...db.gtk[index],
      ...req.body,
      syncStatus: 'pending_sync', // Mark as pending sync when modified locally
    };
    saveData(db);
    broadcastEvent('gtk_updated', db.gtk[index]);
    res.json(db.gtk[index]);
  });

  app.delete('/api/gtk/:id', (req, res) => {
    const { id } = req.params;
    const index = db.gtk.findIndex((g: any) => g.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Data GTK tidak ditemukan' });
    }
    const removed = db.gtk.splice(index, 1)[0];
    saveData(db);
    broadcastEvent('gtk_deleted', { id });
    res.json({ message: 'GTK berhasil dihapus', data: removed });
  });

  // API: Siswa (Peserta Didik / Dapodik)
  app.get('/api/siswa', (req, res) => {
    res.json(db.siswa);
  });

  app.post('/api/siswa', (req, res) => {
    const newSiswa = {
      id: `sis-${Date.now()}`,
      statusValidasiDapodik: 'Valid',
      syncStatus: 'pending_sync',
      lastSyncedAt: null,
      ...req.body,
    };
    db.siswa.unshift(newSiswa);
    saveData(db);
    broadcastEvent('siswa_created', newSiswa);
    res.status(201).json(newSiswa);
  });

  app.put('/api/siswa/:id', (req, res) => {
    const { id } = req.params;
    const index = db.siswa.findIndex((s: any) => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Data Siswa tidak ditemukan' });
    }
    db.siswa[index] = {
      ...db.siswa[index],
      ...req.body,
      syncStatus: 'pending_sync',
    };
    saveData(db);
    broadcastEvent('siswa_updated', db.siswa[index]);
    res.json(db.siswa[index]);
  });

  app.delete('/api/siswa/:id', (req, res) => {
    const { id } = req.params;
    const index = db.siswa.findIndex((s: any) => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Data Siswa tidak ditemukan' });
    }
    const removed = db.siswa.splice(index, 1)[0];
    saveData(db);
    broadcastEvent('siswa_deleted', { id });
    res.json({ message: 'Siswa berhasil dihapus', data: removed });
  });

  // API: Batch Import Siswa from Dapodik
  app.post('/api/siswa/batch-import', (req, res) => {
    const { items = [], overwrite = true } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Tidak ada data siswa untuk diimpor' });
    }

    const now = new Date().toISOString();
    let addedCount = 0;
    let updatedCount = 0;

    for (const item of items) {
      const existingIdx = db.siswa.findIndex(
        (s: any) => (item.nisn && s.nisn === item.nisn) || (item.nik && s.nik === item.nik)
      );
      if (existingIdx !== -1) {
        if (overwrite) {
          db.siswa[existingIdx] = {
            ...db.siswa[existingIdx],
            ...item,
            syncStatus: 'synced',
            lastSyncedAt: now,
          };
          updatedCount++;
        }
      } else {
        const newRecord = {
          id: item.id || `sis-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          statusValidasiDapodik: item.statusValidasiDapodik || 'Valid',
          statusSiswa: item.statusSiswa || 'Aktif',
          syncStatus: 'synced',
          lastSyncedAt: now,
          ...item,
        };
        db.siswa.unshift(newRecord);
        addedCount++;
      }
    }

    const logEntry = {
      id: `log-${Date.now()}`,
      timestamp: now,
      type: 'IMPORT_DAPODIK',
      direction: 'PULL',
      status: 'SUCCESS',
      gtkCount: db.gtk.length,
      siswaCount: db.siswa.length,
      message: `Impor data Siswa dari Dapodik berhasil: ${addedCount} baru, ${updatedCount} diperbarui.`,
      durationMs: 380,
    };

    db.syncLogs = [logEntry, ...(db.syncLogs || [])].slice(0, 50);
    saveData(db);

    broadcastEvent('sync_completed', {
      log: logEntry,
      gtk: db.gtk,
      siswa: db.siswa,
      sekolah: db.sekolah,
    });

    res.json({
      success: true,
      addedCount,
      updatedCount,
      totalCount: db.siswa.length,
      message: `Berhasil mengimpor ${addedCount + updatedCount} data siswa ke database web.`,
    });
  });

  // API: Get Sync Logs
  app.get('/api/sync/logs', (req, res) => {
    res.json(db.syncLogs || []);
  });

  // API: Reset database to zero data
  app.post('/api/reset', (req, res) => {
    db.gtk = [];
    db.siswa = [];
    db.syncLogs = [];
    db.sekolah.lastSyncTime = null;
    saveData(db);

    broadcastEvent('sync_completed', {
      log: {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'RESET',
        direction: 'BIDIRECTIONAL',
        status: 'SUCCESS',
        gtkCount: 0,
        siswaCount: 0,
        message: 'Database berhasil direset ke nol data (0 GTK, 0 Siswa).',
        durationMs: 40,
      },
      gtk: [],
      siswa: [],
      sekolah: db.sekolah,
    });

    res.json({ success: true, message: 'Database telah dikosongkan ke nol data.' });
  });

  // API: Trigger Real-time Sync with Dapodik Web Service
  app.post('/api/dapodik/sync', async (req, res) => {
    const startTime = Date.now();
    const { mode = 'FULL_SYNC' } = req.body;

    // Simulate network latency of talking to Dapodik Kemendikbud REST API
    await new Promise((resolve) => setTimeout(resolve, 800));

    const syncTime = new Date().toISOString();

    // Mark all existing GTK and Siswa as synced
    db.gtk = db.gtk.map((g: any) => ({
      ...g,
      syncStatus: 'synced',
      lastSyncedAt: syncTime,
    }));

    db.siswa = db.siswa.map((s: any) => ({
      ...s,
      syncStatus: 'synced',
      lastSyncedAt: syncTime,
    }));

    db.sekolah.lastSyncTime = syncTime;

    const logEntry = {
      id: `log-${Date.now()}`,
      timestamp: syncTime,
      type: mode,
      direction: 'BIDIRECTIONAL',
      status: 'SUCCESS',
      gtkCount: db.gtk.length,
      siswaCount: db.siswa.length,
      message: `Sinkronisasi Web Service Dapodik selesai. ${db.gtk.length} GTK dan ${db.siswa.length} Siswa berhasil disinkronkan.`,
      durationMs: Date.now() - startTime,
    };

    db.syncLogs = [logEntry, ...(db.syncLogs || [])].slice(0, 50);
    saveData(db);

    // Broadcast sync event to all connected browsers in real time!
    broadcastEvent('sync_completed', {
      log: logEntry,
      gtk: db.gtk,
      siswa: db.siswa,
      sekolah: db.sekolah,
    });

    res.json({
      success: true,
      log: logEntry,
      lastSyncTime: syncTime,
      gtkCount: db.gtk.length,
      siswaCount: db.siswa.length,
    });
  });

  // API: Dapodik Simulator - Webhook or External Push
  // Allows simulating when an external Dapodik server pushes a new teacher or student change
  app.post('/api/dapodik/simulate-external-change', (req, res) => {
    const { target = 'gtk' } = req.body;
    const now = new Date().toISOString();

    if (target === 'gtk') {
      const sampleNames = [
        'Drs. H. Miftahul Huda, M.Si.',
        'Wahyuni Tri Utami, S.Pd., M.Hum.',
        'Agus Setiawan, S.Pd.',
        'Novi Damayanti, S.Pd., Gr.',
      ];
      const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      const randomNik = `35780${Math.floor(10000000000 + Math.random() * 90000000000)}`;
      const randomNip = `19${Math.floor(70 + Math.random() * 25)}010120${Math.floor(10 + Math.random() * 14)}01100${Math.floor(1 + Math.random() * 9)}`;

      const externalGtk = {
        id: `gtk-ext-${Date.now()}`,
        nik: randomNik,
        nip: randomNip,
        nuptk: `89${Math.floor(10000000000000 + Math.random() * 90000000000000)}`,
        nama: randomName,
        jenisKelamin: Math.random() > 0.5 ? 'L' : 'P',
        tempatLahir: 'Surabaya',
        tanggalLahir: '1984-06-15',
        agama: 'Islam',
        statusKepegawaian: 'PNS',
        jenisPtk: 'Guru Mapel',
        pangkatGolongan: 'Penata (III/c)',
        skPengangkatan: `813.1/${Math.floor(100 + Math.random() * 899)}/2024`,
        tmtPengangkatan: '2014-01-01',
        pendidikanTerakhir: 'S1 Pendidikan',
        bidangStudi: 'Biologi / IPA',
        statusSertifikasi: 'Sudah Bersertifikasi',
        nomorSertifikatPendidik: `120532189${Math.floor(100 + Math.random() * 899)}`,
        jamMengajarPerMinggu: 24,
        noHp: `0812${Math.floor(10000000 + Math.random() * 90000000)}`,
        email: `${randomName.toLowerCase().replace(/[^a-z]/g, '').slice(0, 10)}@sekolah.sch.id`,
        syncStatus: 'synced',
        lastSyncedAt: now,
      };

      db.gtk.unshift(externalGtk);

      const logEntry = {
        id: `log-${Date.now()}`,
        timestamp: now,
        type: 'REALTIME_WEBHOOK',
        direction: 'PULL',
        status: 'SUCCESS',
        gtkCount: db.gtk.length,
        siswaCount: db.siswa.length,
        message: `Webhook Dapodik Pusat: Data GTK "${externalGtk.nama}" otomatis tersinkron ke SIM Kepegawaian.`,
        durationMs: 310,
      };

      db.syncLogs = [logEntry, ...(db.syncLogs || [])].slice(0, 50);
      saveData(db);

      broadcastEvent('sync_completed', {
        log: logEntry,
        gtk: db.gtk,
        siswa: db.siswa,
        sekolah: db.sekolah,
      });

      return res.json({ message: 'GTK berhasil disimulasikan', data: externalGtk });
    } else {
      const sampleSiswa = [
        'Zahra Aulia Putri',
        'Bagus Dwi Wicaksono',
        'Keisha Aurelia Ramadhani',
        'Galang Arya Pratama',
      ];
      const randomName = sampleSiswa[Math.floor(Math.random() * sampleSiswa.length)];
      const randomNisn = `00${Math.floor(80000000 + Math.random() * 19999999)}`;

      const externalSiswa = {
        id: `sis-ext-${Date.now()}`,
        nisn: randomNisn,
        nipd: `${Math.floor(24000 + Math.random() * 999)}`,
        nik: `35780${Math.floor(10000000000 + Math.random() * 90000000000)}`,
        nama: randomName,
        jenisKelamin: Math.random() > 0.5 ? 'L' : 'P',
        tingkatKelas: 'X',
        rombel: 'X-3 (Fase E)',
        jurusan: 'Fase E (Umum)',
        tempatLahir: 'Surabaya',
        tanggalLahir: '2009-04-12',
        agama: 'Islam',
        alamat: 'Jl. Kutai No. 25, Wonokromo',
        namaAyah: 'Budi Santoso',
        namaIbu: 'Sri Rahayu',
        noHpOrtu: `0813${Math.floor(10000000 + Math.random() * 90000000)}`,
        statusSiswa: 'Aktif',
        statusValidasiDapodik: 'Valid',
        syncStatus: 'synced',
        lastSyncedAt: now,
      };

      db.siswa.unshift(externalSiswa);

      const logEntry = {
        id: `log-${Date.now()}`,
        timestamp: now,
        type: 'REALTIME_WEBHOOK',
        direction: 'PULL',
        status: 'SUCCESS',
        gtkCount: db.gtk.length,
        siswaCount: db.siswa.length,
        message: `Webhook Dapodik Pusat: Data Siswa "${externalSiswa.nama}" (NISN: ${externalSiswa.nisn}) tersinkron secara real-time.`,
        durationMs: 290,
      };

      db.syncLogs = [logEntry, ...(db.syncLogs || [])].slice(0, 50);
      saveData(db);

      broadcastEvent('sync_completed', {
        log: logEntry,
        gtk: db.gtk,
        siswa: db.siswa,
        sekolah: db.sekolah,
      });

      return res.json({ message: 'Siswa berhasil disimulasikan', data: externalSiswa });
    }
  });

  // Mount Vite middleware in development
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`SIM Dapodik & Kepegawaian running at http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
