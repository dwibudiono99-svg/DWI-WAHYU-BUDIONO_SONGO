import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Users,
  GraduationCap,
  ArrowDownCircle,
  ArrowUpCircle,
  Activity,
} from 'lucide-react';
import { SyncLog } from '../types/dapodik';

interface SyncLogsViewProps {
  logs: SyncLog[];
  onTriggerSync: () => void;
  isSyncing: boolean;
}

export const SyncLogsView: React.FC<SyncLogsViewProps> = ({
  logs,
  onTriggerSync,
  isSyncing,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Riwayat Log Sinkronisasi Dapodik & Kepegawaian
          </h2>
          <p className="text-xs text-slate-400">
            Jejak audit sinkronisasi data GTK dan Siswa dengan server Web Service
          </p>
        </div>
        <button
          onClick={onTriggerSync}
          disabled={isSyncing}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Menyinkronkan...' : 'Jalankan Sinkronisasi Penuh'}</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 bg-slate-850/50 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-300 font-medium">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Audit Trail Log ({logs.length} Kejadian Tercatat)</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Real-time Event Stream</span>
        </div>

        <div className="divide-y divide-slate-800">
          {logs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Belum ada log sinkronisasi tercatat. Klik "Jalankan Sinkronisasi Penuh" untuk memulai.
            </div>
          ) : (
            logs.map((log) => {
              const isSuccess = log.status === 'SUCCESS';
              const date = new Date(log.timestamp);
              const formattedDate = date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
              const formattedTime = date.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              }) + ' WIB';

              return (
                <div key={log.id} className="p-4 hover:bg-slate-800/40 transition text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        {isSuccess ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-white">
                            {log.type === 'FULL_SYNC'
                              ? 'Sinkronisasi Penuh Dua Arah'
                              : log.type === 'REALTIME_WEBHOOK'
                              ? 'Pembaruan Real-Time Webhook'
                              : log.type}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                              log.direction === 'PULL'
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {log.direction}
                          </span>
                        </div>
                        <p className="text-slate-300 mt-1 leading-relaxed">
                          {log.message}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-400 font-mono">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-blue-400" />
                            {log.gtkCount} GTK
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-3 h-3 text-indigo-400" />
                            {log.siswaCount} Siswa
                          </span>
                          <span>·</span>
                          <span>Durasi: {log.durationMs}ms</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 text-slate-400 text-[11px] font-mono sm:self-start">
                      <div>{formattedTime}</div>
                      <div className="text-slate-500 text-[10px]">{formattedDate}</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
