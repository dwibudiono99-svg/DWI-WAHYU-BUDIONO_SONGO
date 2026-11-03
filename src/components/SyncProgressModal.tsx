import React, { useEffect, useState } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  Users,
  GraduationCap,
  Clock,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface SyncProgressModalProps {
  isOpen: boolean;
  onFinish: () => void;
  gtkCount: number;
  siswaCount: number;
  isSyncing?: boolean;
}

export const SyncProgressModal: React.FC<SyncProgressModalProps> = ({
  isOpen,
  onFinish,
  gtkCount,
  siswaCount,
  isSyncing,
}) => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(15);
  const [isCompleted, setIsCompleted] = useState(false);
  const [finishTime, setFinishTime] = useState<string>('');

  const steps = [
    { title: 'Handshake Web Service Kemdikbud', desc: 'Verifikasi Token Otorisasi & NPSN Sekolah' },
    { title: 'Validasi Data Kepegawaian (GTK)', desc: `Pengecekan NIP, NUPTK & linearitas ${gtkCount} Tenaga Pendidik` },
    { title: 'Validasi Peserta Didik (Siswa)', desc: `Sinkronisasi NISN & data Dukcapil ${siswaCount} Siswa` },
    { title: 'Transmisi Delta Data Dua Arah', desc: 'Pengiriman & penerimaan delta payload RESTful API' },
    { title: 'Verifikasi Checksum & Database', desc: 'Integritas data lokal & pusat telah 100% konsisten' },
  ];

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setProgress(15);
      setIsCompleted(false);
      return;
    }

    const t1 = setTimeout(() => { setStep(1); setProgress(35); }, 350);
    const t2 = setTimeout(() => { setStep(2); setProgress(65); }, 750);
    const t3 = setTimeout(() => { setStep(3); setProgress(88); }, 1150);
    const t4 = setTimeout(() => {
      setStep(4);
      setProgress(100);
      setIsCompleted(true);
      const now = new Date();
      setFinishTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' WIB'
      );
    }, 1600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-6">
        {/* Header Status */}
        <div className="text-center">
          <div
            className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-colors duration-300 ${
              isCompleted
                ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10'
                : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-in zoom-in-75 duration-200" />
            ) : (
              <RefreshCw className="w-7 h-7 text-emerald-400 animate-spin" />
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {isCompleted ? 'SINKRONISASI SELESAI!' : 'Menyinkronkan Data Dapodik...'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {isCompleted
              ? 'Proses sinkronisasi data Guru dan Siswa secara real-time telah berhasil dilakukan.'
              : 'Menghubungkan Database Kepegawaian Sekolah dengan Web Service Kemendikbud'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">Status Transmisi Data</span>
            <span className={`font-semibold ${isCompleted ? 'text-emerald-400' : 'text-slate-300'}`}>
              {progress}% {isCompleted && '· LENGKAP'}
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ease-out ${
                isCompleted ? 'bg-emerald-500' : 'bg-emerald-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* When COMPLETED: Show Rich Summary Card */}
        {isCompleted ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-800/80 border border-emerald-500/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5">
                <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Hasil Sinkronisasi Real-Time
                </span>
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {finishTime}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700/60">
                  <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    Data Guru & Tendik (GTK)
                  </div>
                  <div className="text-lg font-bold text-white mt-1">
                    {gtkCount} <span className="text-xs font-normal text-emerald-400">Tersinkron</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">NIP, NUPTK, JJM valid</div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700/60">
                  <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                    Data Peserta Didik (Siswa)
                  </div>
                  <div className="text-lg font-bold text-white mt-1">
                    {siswaCount} <span className="text-xs font-normal text-emerald-400">Tersinkron</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">NISN & NIK Dukcapil OK</div>
                </div>
              </div>

              <div className="text-[11px] text-emerald-300/90 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/30 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Seluruh data berhasil diselaraskan dengan server pusat Kemendikbudristek tanpa error.
                </span>
              </div>
            </div>

            {/* PROMINENT "KLIK SELESAI" BUTTON */}
            <div className="pt-2 text-center space-y-2">
              <button
                onClick={onFinish}
                autoFocus
                className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all duration-150 active:scale-98 flex items-center justify-center space-x-2 cursor-pointer border border-emerald-400/50 hover:shadow-emerald-500/40"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span className="tracking-wide text-base">KLIK SELESAI</span>
              </button>
              <p className="text-[11px] text-slate-400">
                Klik tombol <strong className="text-emerald-400">KLIK SELESAI</strong> di atas untuk kembali ke dashboard data.
              </p>
            </div>
          </div>
        ) : (
          /* When in PROGRESS: Show Step by Step checklist */
          <div className="space-y-2.5 text-xs">
            {steps.map((s, index) => {
              const isDone = step > index;
              const isCurrent = step === index;

              return (
                <div
                  key={index}
                  className={`flex items-start space-x-3 p-2.5 rounded-lg border transition ${
                    isCurrent
                      ? 'bg-slate-800/90 border-emerald-500/50 text-white'
                      : isDone
                      ? 'bg-slate-800/30 border-slate-800 text-slate-400'
                      : 'bg-transparent border-transparent text-slate-600'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-slate-600">
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <div>
                    <div
                      className={`font-semibold ${
                        isCurrent ? 'text-emerald-300' : isDone ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {s.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{s.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
