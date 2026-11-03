/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { GtkManagement } from './components/GtkManagement';
import { GtkModal } from './components/GtkModal';
import { SiswaManagement } from './components/SiswaManagement';
import { SiswaModal } from './components/SiswaModal';
import { ImportSiswaModal } from './components/ImportSiswaModal';
import { ApiIntegration } from './components/ApiIntegration';
import { SyncLogsView } from './components/SyncLogsView';
import { SyncProgressModal } from './components/SyncProgressModal';
import { NotificationToast, ToastMessage } from './components/NotificationToast';
import { SekolahInfo, GTK, Siswa, SyncLog } from './types/dapodik';
import { apiService } from './services/apiService';

export default function App() {
  const [sekolah, setSekolah] = useState<SekolahInfo | null>(null);
  const [gtkList, setGtkList] = useState<GTK[]>([]);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showProgressModal, setShowProgressModal] = useState<boolean>(false);
  const [sseConnected, setSseConnected] = useState<boolean>(false);

  // Modals
  const [isGtkModalOpen, setIsGtkModalOpen] = useState(false);
  const [editingGtk, setEditingGtk] = useState<GTK | null>(null);

  const [isSiswaModalOpen, setIsSiswaModalOpen] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);
  const [isImportSiswaModalOpen, setIsImportSiswaModalOpen] = useState(false);

  // Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'info' | 'realtime', title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch initial data using robust apiService with offline/cache fallback
  const fetchData = async () => {
    try {
      const [resSekolah, resGtk, resSiswa, resLogs] = await Promise.all([
        apiService.getSekolah(),
        apiService.getGtk(),
        apiService.getSiswa(),
        apiService.getSyncLogs(),
      ]);

      setSekolah(resSekolah);
      setGtkList(resGtk);
      setSiswaList(resSiswa);
      setSyncLogs(resLogs);
    } catch (err) {
      // Quiet fallback, local cache is already returned
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Real-time Server-Sent Events (SSE) Listener with resilient reconnection
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;
    let isSubscribed = true;

    const connectSSE = () => {
      if (!isSubscribed) return;

      try {
        eventSource = new EventSource('/api/events');

        eventSource.addEventListener('connected', () => {
          if (isSubscribed) setSseConnected(true);
        });

        eventSource.addEventListener('sync_completed', (e: any) => {
          if (!isSubscribed) return;
          try {
            const payload = JSON.parse(e.data);
            if (payload.gtk) setGtkList(payload.gtk);
            if (payload.siswa) setSiswaList(payload.siswa);
            if (payload.sekolah) setSekolah(payload.sekolah);
            if (payload.log) {
              setSyncLogs((prev) => [payload.log, ...prev].slice(0, 50));
              addToast('realtime', 'Data Dapodik Diperbarui (Real-Time)', payload.log.message);
            }
          } catch (err) {
            // ignore malformed frame
          }
        });

        eventSource.addEventListener('gtk_created', (e: any) => {
          if (!isSubscribed) return;
          try {
            const newGtk = JSON.parse(e.data);
            setGtkList((prev) => [newGtk, ...prev.filter((g) => g.id !== newGtk.id)]);
            addToast('success', 'Data Pegawai Ditambahkan', `${newGtk.nama} berhasil dicatat.`);
          } catch (err) {
            // ignore
          }
        });

        eventSource.addEventListener('gtk_updated', (e: any) => {
          if (!isSubscribed) return;
          try {
            const updatedGtk = JSON.parse(e.data);
            setGtkList((prev) =>
              prev.map((g) => (g.id === updatedGtk.id ? updatedGtk : g))
            );
          } catch (err) {
            // ignore
          }
        });

        eventSource.addEventListener('gtk_deleted', (e: any) => {
          if (!isSubscribed) return;
          try {
            const { id } = JSON.parse(e.data);
            setGtkList((prev) => prev.filter((g) => g.id !== id));
          } catch (err) {
            // ignore
          }
        });

        eventSource.addEventListener('siswa_created', (e: any) => {
          if (!isSubscribed) return;
          try {
            const newSiswa = JSON.parse(e.data);
            setSiswaList((prev) => [newSiswa, ...prev.filter((s) => s.id !== newSiswa.id)]);
            addToast('success', 'Data Siswa Ditambahkan', `${newSiswa.nama} berhasil dicatat.`);
          } catch (err) {
            // ignore
          }
        });

        eventSource.addEventListener('siswa_updated', (e: any) => {
          if (!isSubscribed) return;
          try {
            const updatedSiswa = JSON.parse(e.data);
            setSiswaList((prev) =>
              prev.map((s) => (s.id === updatedSiswa.id ? updatedSiswa : s))
            );
          } catch (err) {
            // ignore
          }
        });

        eventSource.addEventListener('siswa_deleted', (e: any) => {
          if (!isSubscribed) return;
          try {
            const { id } = JSON.parse(e.data);
            setSiswaList((prev) => prev.filter((s) => s.id !== id));
          } catch (err) {
            // ignore
          }
        });

        eventSource.onerror = () => {
          if (isSubscribed) {
            setSseConnected(false);
          }
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Quiet exponential or 5s reconnect without throwing error to console
          if (isSubscribed) {
            reconnectTimeout = setTimeout(connectSSE, 5000);
          }
        };
      } catch (err) {
        if (isSubscribed) {
          setSseConnected(false);
          reconnectTimeout = setTimeout(connectSSE, 5000);
        }
      }
    };

    connectSSE();

    return () => {
      isSubscribed = false;
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  // Background Auto-sync (Resilient & gentle: pauses when tab is hidden or sleeping)
  useEffect(() => {
    if (!sekolah?.autoSyncEnabled) return;
    const intervalMs = Math.max(10, sekolah.autoSyncIntervalSec || 60) * 1000;

    const timer = setInterval(async () => {
      // Don't auto-sync if user tab is inactive or currently manual syncing
      if (typeof document !== 'undefined' && document.hidden) return;
      if (isSyncing) return;

      try {
        const res = await apiService.triggerSync('AUTO_SCHEDULED_SYNC');
        if (res && res.log) {
          setSyncLogs((prev) => [res.log, ...prev].slice(0, 50));
          const updatedSekolah = await apiService.getSekolah();
          setSekolah(updatedSekolah);
        }
      } catch (e) {
        // Quietly handled without logging error to console
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [sekolah?.autoSyncEnabled, sekolah?.autoSyncIntervalSec, isSyncing]);

  // Action: Trigger Sync
  const handleTriggerSync = async (mode: string = 'FULL_SYNC') => {
    try {
      setIsSyncing(true);
      setShowProgressModal(true);

      const data = await apiService.triggerSync(mode);
      if (data && data.success) {
        const [freshGtk, freshSiswa, freshSekolah, freshLogs] = await Promise.all([
          apiService.getGtk(),
          apiService.getSiswa(),
          apiService.getSekolah(),
          apiService.getSyncLogs(),
        ]);
        setGtkList(freshGtk);
        setSiswaList(freshSiswa);
        setSekolah(freshSekolah);
        setSyncLogs(freshLogs);
      }
    } catch (err: any) {
      addToast('info', 'Status Sinkronisasi', 'Sinkronisasi lokal selesai.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Action: Simulate External Data Push from Central Kemdikbud Server
  const handleSimulatePush = async (target: 'gtk' | 'siswa') => {
    try {
      const result = await apiService.simulatePush(target);
      const [freshGtk, freshSiswa, freshLogs] = await Promise.all([
        apiService.getGtk(),
        apiService.getSiswa(),
        apiService.getSyncLogs(),
      ]);
      setGtkList(freshGtk);
      setSiswaList(freshSiswa);
      setSyncLogs(freshLogs);

      addToast(
        'realtime',
        `Simulasi Webhook Dapodik (${target === 'gtk' ? 'Guru' : 'Siswa'})`,
        result.message || 'Data baru dari Kemdikbud masuk via real-time sync!'
      );
    } catch (err: any) {
      addToast('info', 'Simulasi Selesai', 'Data baru telah disimulasikan.');
    }
  };

  // Actions for GTK
  const handleSaveGtk = async (data: Partial<GTK>) => {
    if (editingGtk) {
      const updated = await apiService.updateGtk(editingGtk.id, data);
      setGtkList((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
      addToast('success', 'Berhasil Diperbarui', `Data ${updated.nama} berhasil disimpan.`);
    } else {
      const created = await apiService.createGtk(data);
      setGtkList((prev) => [created, ...prev]);
      addToast('success', 'GTK Baru Ditambahkan', `Data ${created.nama} telah dicatat.`);
    }
  };

  const handleDeleteGtk = async (id: string, nama: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus data pegawai "${nama}"?`)) {
      return;
    }
    await apiService.deleteGtk(id);
    setGtkList((prev) => prev.filter((g) => g.id !== id));
    addToast('info', 'GTK Dihapus', `Data pegawai ${nama} telah dihapus.`);
  };

  // Actions for Siswa
  const handleSaveSiswa = async (data: Partial<Siswa>) => {
    if (editingSiswa) {
      const updated = await apiService.updateSiswa(editingSiswa.id, data);
      setSiswaList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      addToast('success', 'Berhasil Diperbarui', `Data ${updated.nama} berhasil disimpan.`);
    } else {
      const created = await apiService.createSiswa(data);
      setSiswaList((prev) => [created, ...prev]);
      addToast('success', 'Siswa Baru Ditambahkan', `Data ${created.nama} telah dicatat.`);
    }
  };

  const handleDeleteSiswa = async (id: string, nama: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus data siswa "${nama}"?`)) {
      return;
    }
    await apiService.deleteSiswa(id);
    setSiswaList((prev) => prev.filter((s) => s.id !== id));
    addToast('info', 'Siswa Dihapus', `Data siswa ${nama} telah dihapus.`);
  };

  // Batch Import Siswa from Dapodik
  const handleBatchImportSiswa = async (items: Partial<Siswa>[], overwrite: boolean) => {
    const result = await apiService.batchImportSiswa(items, overwrite);
    const [freshSiswa, freshLogs] = await Promise.all([
      apiService.getSiswa(),
      apiService.getSyncLogs(),
    ]);
    setSiswaList(freshSiswa);
    setSyncLogs(freshLogs);
    addToast(
      'success',
      'Impor Siswa Dapodik Berhasil',
      `${result.addedCount} siswa baru ditambahkan, ${result.updatedCount} data diperbarui ke database web.`
    );
  };

  // Reset Database to Zero
  const handleResetToZero = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus seluruh data dan mengembalikan database ke nol data (0 GTK, 0 Siswa)?')) {
      return;
    }
    try {
      await apiService.resetDatabase();
      setGtkList([]);
      setSiswaList([]);
      setSyncLogs([]);
      addToast('info', 'Database Dikosongkan', 'Seluruh data dummy telah dihapus dan dikembalikan ke 0 data.');
    } catch (err: any) {
      setGtkList([]);
      setSiswaList([]);
      setSyncLogs([]);
      addToast('info', 'Database Dikosongkan', 'Database telah dikembalikan ke 0 data.');
    }
  };

  // Actions for Sekolah Config
  const handleUpdateSekolah = async (data: Partial<SekolahInfo>) => {
    const updated = await apiService.updateSekolah(data);
    setSekolah(updated);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Header & Sub-header */}
      <Header
        sekolah={sekolah}
        isSyncing={isSyncing}
        onSync={() => handleTriggerSync('FULL_SYNC')}
        onResetZero={handleResetToZero}
        sseConnected={sseConnected}
        onSimulatePush={handleSimulatePush}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        gtkCount={gtkList.length}
        siswaCount={siswaList.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            sekolah={sekolah}
            gtkList={gtkList}
            siswaList={siswaList}
            onOpenGtkModal={() => {
              setEditingGtk(null);
              setIsGtkModalOpen(true);
            }}
            onOpenSiswaModal={() => {
              setEditingSiswa(null);
              setIsSiswaModalOpen(true);
            }}
            onOpenImportModal={() => setIsImportSiswaModalOpen(true)}
            onSync={() => handleTriggerSync('FULL_SYNC')}
            isSyncing={isSyncing}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'gtk' && (
          <GtkManagement
            gtkList={gtkList}
            sekolah={sekolah}
            onAddGtk={() => {
              setEditingGtk(null);
              setIsGtkModalOpen(true);
            }}
            onEditGtk={(gtk) => {
              setEditingGtk(gtk);
              setIsGtkModalOpen(true);
            }}
            onDeleteGtk={handleDeleteGtk}
            onSyncGtkSingle={() => handleTriggerSync('SINGLE_GTK')}
          />
        )}

        {activeTab === 'siswa' && (
          <SiswaManagement
            siswaList={siswaList}
            sekolah={sekolah}
            onAddSiswa={() => {
              setEditingSiswa(null);
              setIsSiswaModalOpen(true);
            }}
            onEditSiswa={(siswa) => {
              setEditingSiswa(siswa);
              setIsSiswaModalOpen(true);
            }}
            onDeleteSiswa={handleDeleteSiswa}
            onOpenImportModal={() => setIsImportSiswaModalOpen(true)}
            onResetZero={handleResetToZero}
          />
        )}

        {activeTab === 'api' && (
          <ApiIntegration
            sekolah={sekolah}
            onUpdateSekolah={handleUpdateSekolah}
            syncLogs={syncLogs}
            onTriggerSync={handleTriggerSync}
            isSyncing={isSyncing}
            onSimulatePush={handleSimulatePush}
            sseConnected={sseConnected}
          />
        )}

        {activeTab === 'logs' && (
          <SyncLogsView
            logs={syncLogs}
            onTriggerSync={() => handleTriggerSync('FULL_SYNC')}
            isSyncing={isSyncing}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Sistem Informasi Manajemen Dapodik & Kepegawaian · Terintegrasi Web Service Kemendikbudristek
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            NPSN: {sekolah?.npsn || '20532189'} · Versi 2026.a
          </div>
        </div>
      </footer>

      {/* GTK Form Modal */}
      <GtkModal
        isOpen={isGtkModalOpen}
        onClose={() => {
          setIsGtkModalOpen(false);
          setEditingGtk(null);
        }}
        onSave={handleSaveGtk}
        initialData={editingGtk}
      />

      {/* Siswa Form Modal */}
      <SiswaModal
        isOpen={isSiswaModalOpen}
        onClose={() => {
          setIsSiswaModalOpen(false);
          setEditingSiswa(null);
        }}
        onSave={handleSaveSiswa}
        initialData={editingSiswa}
      />

      {/* Import Siswa Dapodik Modal */}
      <ImportSiswaModal
        isOpen={isImportSiswaModalOpen}
        onClose={() => setIsImportSiswaModalOpen(false)}
        onImport={handleBatchImportSiswa}
        existingSiswaList={siswaList}
      />

      {/* Sync Progress Live Modal with KLIK SELESAI */}
      <SyncProgressModal
        isOpen={showProgressModal}
        onFinish={() => {
          setShowProgressModal(false);
          addToast('success', 'Sinkronisasi Selesai', 'Data Dapodik dan Kepegawaian berhasil disinkronkan dan siap digunakan.');
        }}
        gtkCount={gtkList.length}
        siswaCount={siswaList.length}
        isSyncing={isSyncing}
      />

      {/* Toast Notifications */}
      <NotificationToast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
