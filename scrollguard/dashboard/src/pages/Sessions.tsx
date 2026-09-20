import { useState } from 'react';
import { Layers, AlertTriangle, CheckCircle, Clock, Film, ChevronDown, ChevronUp } from 'lucide-react';
import type { BackupData, Session } from '../shared/types';

interface SessionsProps {
  data: BackupData;
}

export default function Sessions({ data }: SessionsProps) {
  // Sort sessions chronologically (newest first)
  const sortedSessions = [...data.sessions].sort((a, b) => b.startTime - a.startTime);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString([], {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-950/20 select-none">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        
        {/* Header Summary */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Session History Log</h3>
              <p className="text-xs text-slate-400">
                Explore continuous browsing sessions and click to expand individual video events timeline.
              </p>
            </div>
          </div>
        </div>

        {/* Sessions Timeline List */}
        <div className="flex flex-col gap-4">
          {sortedSessions.length > 0 ? (
            sortedSessions.map((session, index) => {
              // Calculate gap/break from the previous session (descending index order)
              let gapNotice = null;
              if (index < sortedSessions.length - 1) {
                const prevSession = sortedSessions[index + 1];
                const gapMs = session.startTime - prevSession.endTime;
                const gapMins = Math.round(gapMs / 60000);

                const prevHour = new Date(prevSession.endTime).getHours();
                if (gapMins >= 20 && prevHour >= 6 && prevHour < 23) {
                  gapNotice = (
                    <div className="mt-3 flex items-center gap-1.5 py-1.5 px-3 bg-emerald-500/5 text-emerald-400 text-[10px] font-semibold border border-emerald-500/10 rounded-lg">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Mindful Break Taken: +{gapMins} minutes gap between sessions.</span>
                    </div>
                  );
                }
              }

              return (
                <SessionCard
                  key={session.sessionId}
                  session={session as any}
                  formatDate={formatDate}
                  gapNotice={gapNotice}
                  isBinge={session.endTime - session.startTime > 25 * 60 * 1000}
                />
              );
            })
          ) : (
            <div className="text-center py-10 bg-slate-900/40 border border-slate-900 rounded-2xl text-xs text-slate-500">
              No sessions found. Import your data or test with demo data.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

interface SessionCardProps {
  session: Session;
  formatDate: (timestamp: number) => string;
  gapNotice: React.ReactNode;
  isBinge: boolean;
}

function SessionCard({ session, formatDate, gapNotice, isBinge }: SessionCardProps) {
  const [expanded, setExpanded] = useState(false);

  const durationMs = session.endTime - session.startTime;
  const durationMins = Math.round(durationMs / 60000);
  const numClips = session.videoEvents.length;
  const avgSecondsPerVideo = numClips > 0 ? (durationMs / numClips) / 1000 : 0;

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`bg-slate-900/40 border p-5 rounded-2xl backdrop-blur-md transition-all duration-150 hover:border-slate-800 cursor-pointer ${
        isBinge 
          ? 'border-amber-500/30 shadow-lg shadow-amber-950/5' 
          : 'border-slate-900'
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-900/60">
        <div className="flex items-center gap-2">
          <span className="capitalize font-bold text-white text-sm">{session.platform}</span>
          <span className="text-slate-500">•</span>
          <span className="text-[10px] bg-slate-900 border border-slate-850 px-2 py-0.5 rounded text-slate-400 font-semibold uppercase tracking-wider">
            {formatDate(session.startTime)}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">
            {formatTime(session.startTime)} – {formatTime(session.endTime)}
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Clock className="w-4 h-4 text-indigo-400" />
          <div>
            <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Duration</p>
            <p className="font-semibold text-white mt-0.5">{durationMins} mins</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <Film className="w-4 h-4 text-purple-400" />
          <div>
            <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Clips</p>
            <p className="font-semibold text-white mt-0.5">{numClips} clips</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <Layers className="w-4 h-4 text-pink-400" />
          <div>
            <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Avg Pace</p>
            <p className="font-semibold text-white mt-0.5">{avgSecondsPerVideo.toFixed(1)}s/video</p>
          </div>
        </div>
      </div>

      {/* Expanded Segment Timeline */}
      {expanded && (
        <div className="mt-5 pt-4 border-t border-slate-900/60 flex flex-col gap-2.5" onClick={(e) => e.stopPropagation()}>
          <h4 className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">
            Clips Watched Timeline ({numClips} segments)
          </h4>
          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
            {session.videoEvents.map((evt, i) => {
              let badge = 'Watched';
              let badgeColor = 'text-slate-400 bg-slate-950 border-slate-900';
              if (evt.completed) {
                badge = 'Completed';
                badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
              } else if (evt.skipped) {
                badge = 'Skipped';
                badgeColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
              } else if (evt.wasRepeat) {
                badge = 'Repeat';
                badgeColor = 'text-purple-400 bg-purple-500/10 border-purple-500/20';
              }

              return (
                <div key={i} className="flex items-center justify-between py-2 px-3 bg-slate-950/40 border border-slate-900 rounded-xl text-[11px] text-slate-300 hover:border-slate-800 transition-all">
                  <div className="flex items-center gap-2.5">
                    <span className="text-slate-500 font-bold">#{i + 1}</span>
                    <span className="font-mono text-[10px] text-slate-400">ID: {evt.videoId}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-200">
                      {evt.watchDurationMs < 1000 ? `${evt.watchDurationMs}ms` : `${(evt.watchDurationMs / 1000).toFixed(1)}s`}
                    </span>
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${badgeColor}`}>
                      {badge}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Binge Alert Indicator */}
      {isBinge && (
        <div className="mt-4 flex items-center gap-2 p-3 bg-amber-500/5 text-amber-400 text-xs border border-amber-500/10 rounded-xl leading-relaxed">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <div>
            <span className="font-bold">Binge Session Triggered ({durationMins} mins):</span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Continuous consumption patterns exceeding 25 minutes suggest high algorithmic absorption.
              Try setting a visual guard boundary for this platform in your next session.
            </p>
          </div>
        </div>
      )}

      {/* Gap Reward Notice */}
      {gapNotice}
    </div>
  );
}
