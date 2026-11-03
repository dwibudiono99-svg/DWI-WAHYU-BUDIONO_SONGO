import React from 'react';
import {
  RefreshCw,
  Server,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { SekolahInfo } from '../types/dapodik';

interface HeaderProps {
  sekolah: SekolahInfo | null;
  isSyncing: boolean;
  onSync: () => void;
  onResetZero: () => void;
  sseConnected: boolean;
  onSimulatePush: (target: 'gtk' | 'siswa') => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  gtkCount: number;
  siswaCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  sekolah,
  isSyncing,
  onSync,
  onResetZero,
  sseConnected,
  onSimulatePush,
  activeTab,
  setActiveTab,
  gtkCount,
  siswaCount,
}) => {
  const formatTime = (isoString?: string) => {
    if (!isoString) return 'Belum pernah sinkron';
    const date = new Date(isoString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }) + ' WIB';
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      {/* Top Banner: Status Sinkronisasi & Lembaga */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & School identity */}
          <div className="flex items-center space-x-3.5">
            <div className="h-11 w-11 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shrink-0">
              <Building2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                  SIM DAPODIK & KEPEGAWAIAN
                </span>
                <span className="text-slate-500 text-xs">|</span>
                <span className="text-xs text-slate-400">
                  NPSN: {sekolah?.npsn || '20532189'}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                {sekolah?.namaSekolah || 'SMAN 9 SURABAYA'}
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                {sekolah?.alamat || 'Jl. Wijaya Kusuma No. 48, Genteng, Kota Surabaya'} · Semester {sekolah?.semesterAktif || '2025/2026 Genap'}
              </p>
            </div>
          </div>

          {/* Sync Controls & Real-time Indicator */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Live SSE Status Indicator */}
            <div
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                sseConnected
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
              }`}
              title={sseConnected ? 'Koneksi real-time API Web Service aktif' : 'Menghubungkan ke API...'}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    sseConnected ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    sseConnected ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                ></span>
              </span>
              <span>{sseConnected ? 'API Live (Real-Time)' : 'Menghubungkan...'}</span>
            </div>

            {/* Quick Simulate Trigger */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60">
              <span className="text-[11px] text-slate-400 px-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Uji Sync:
              </span>
              <button
                onClick={() => onSimulatePush('gtk')}
                className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition font-medium"
                title="Simulasi Dapodik Pusat Mengirim Data Guru Baru"
              >
                + Guru Dapodik
              </button>
              <button
                onClick={() => onSimulatePush('siswa')}
                className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition font-medium"
                title="Simulasi Dapodik Pusat Mengirim Data Siswa Baru"
              >
                + Siswa Dapodik
              </button>
            </div>

            {/* Reset to Zero Data Button */}
            <button
              onClick={onResetZero}
              className="inline-flex items-center space-x-1 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 border border-slate-700/80 hover:border-rose-700/50 transition cursor-pointer active:scale-95"
              title="Kosongkan database dan kembalikan ke nol data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Nol Data</span>
            </button>

            {/* Manual Sync Button */}
            <button
              onClick={onSync}
              disabled={isSyncing}
              className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition ${
                isSyncing
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-95'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronisasi Sekarang'}</span>
            </button>
          </div>
        </div>

        {/* Sync Info Meta */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-3">
            <span className="flex items-center gap-1">
              <Server className="w-3 h-3 text-slate-500" />
              Endpoint: <code className="text-slate-300 font-mono text-[10px]">{sekolah?.apiEndpoint || 'https://dapodik.kemdikbud.go.id/rest/v1.4'}</code>
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">
              Terakhir Sinkron: <strong className="text-slate-300 font-medium">{formatTime(sekolah?.lastSyncTime)}</strong>
            </span>
          </div>
          <div className="flex items-center space-x-3 mt-1 sm:mt-0 font-medium">
            <span className="text-slate-300">
              Guru/Tendik: <span className="text-white font-bold">{gtkCount}</span>
            </span>
            <span>·</span>
            <span className="text-slate-300">
              Peserta Didik: <span className="text-white font-bold">{siswaCount}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="bg-slate-950/80 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2">
            {[
              { id: 'dashboard', label: 'Ringkasan & Validasi', badge: null },
              { id: 'gtk', label: 'Database Kepegawaian (GTK)', badge: gtkCount },
              { id: 'siswa', label: 'Database Siswa (Dapodik)', badge: siswaCount },
              { id: 'api', label: 'Integrasi API & Web Service', badge: 'Live' },
              { id: 'logs', label: 'Log Sinkronisasi Real-Time', badge: null },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition flex items-center space-x-2 ${
                    active
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge !== null && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        active
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
