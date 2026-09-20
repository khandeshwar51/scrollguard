import { useState, useEffect } from 'react';
import { Shield, BarChart3, Trash2, Clock, Film, Layers, Download, Settings, ChevronLeft } from 'lucide-react';
import { extensionStorage, logStorage } from '../shared/storage';
import { calculateScrollSpeed } from '../shared/analysis/scrollSpeed';
import { calculateDopamineScore } from '../shared/analysis/dopamineScore';
import type { DailyAggregate, Session } from '../shared/types';

export default function App() {
  const [stats, setStats] = useState({ videos: 0, timeMs: 0, sessions: 0 });
  const [loading, setLoading] = useState(true);
  const [aggregate, setAggregate] = useState<DailyAggregate | null>(null);
  const [todaySessions, setTodaySessions] = useState<Session[]>([]);
  const [rollingAvg, setRollingAvg] = useState(50);
  const [showSettings, setShowSettings] = useState(false);
  const [videoLimit, setVideoLimit] = useState(40);
  const [timeLimit, setTimeLimit] = useState(30);

  const getTodayDateString = (): string => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const fetchStats = async () => {
    try {
      const todayStr = getTodayDateString();
      const aggKey = `aggregate_${todayStr}`;

      const statsData = await extensionStorage.get('today_stats', {
        videos: 0,
        timeMs: 0,
        sessions: 0,
      });
      setStats(statsData);

      // Load today's aggregate
      const defaultAggregate: DailyAggregate = {
        date: todayStr,
        totalVideos: 0,
        totalWatchTimeMs: 0,
        byPlatform: {
          youtube: { count: 0, timeMs: 0 },
          instagram: { count: 0, timeMs: 0 },
          facebook: { count: 0, timeMs: 0 },
          tiktok: { count: 0, timeMs: 0 },
          x: { count: 0, timeMs: 0 },
        },
        byHour: {},
      };
      for (let i = 0; i < 24; i++) defaultAggregate.byHour[i] = 0;

      const agg = await extensionStorage.get<DailyAggregate>(aggKey, defaultAggregate);
      setAggregate(agg);

      // Load today's sessions
      const sessions = await logStorage.getSessions();
      const filtered = sessions.filter((s) => {
        const d = new Date(s.startTime);
        const sDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          '0'
        )}-${String(d.getDate()).padStart(2, '0')}`;
        return sDateStr === todayStr;
      });
      setTodaySessions(filtered);

      // Calculate rolling 30-day baseline average
      let allStorage: Record<string, any> = {};
      if (
        typeof chrome !== 'undefined' &&
        chrome.storage &&
        chrome.storage.local
      ) {
        allStorage = await chrome.storage.local.get(null);
      } else {
        // Fallback for development dev-server
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('aggregate_')) {
            const val = localStorage.getItem(key);
            if (val) allStorage[key] = JSON.parse(val);
          }
        }
      }
      let totalVideos = 0;
      let daysCount = 0;
      Object.keys(allStorage).forEach((key) => {
        if (key.startsWith('aggregate_')) {
          const item = allStorage[key];
          totalVideos += item.totalVideos || 0;
          daysCount++;
        }
      });
      setRollingAvg(daysCount > 0 ? totalVideos / daysCount : 50);

      // Load user limits
      const vLimit = await extensionStorage.get('daily_video_limit', 40);
      const tLimit = await extensionStorage.get('daily_time_limit_mins', 30);
      setVideoLimit(vLimit);
      setTimeLimit(tLimit);

      // Trigger background sync
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({ action: 'SYNC_BACKEND' });
      }
    } catch (err) {
      console.error('[ScrollGuard] Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    const handleStorageChange = (
      _changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === 'local') {
        fetchStats();
      }
    };

    if (
      typeof chrome !== 'undefined' &&
      chrome.storage &&
      chrome.storage.onChanged
    ) {
      chrome.storage.onChanged.addListener(handleStorageChange);
      return () => {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      };
    }
  }, []);

  const handleReset = () => {
    if (
      typeof chrome !== 'undefined' &&
      chrome.runtime &&
      chrome.runtime.sendMessage
    ) {
      chrome.runtime.sendMessage({ action: 'RESET_STATS' }, (res) => {
        if (res && res.success) {
          setStats({ videos: 0, timeMs: 0, sessions: 0 });
          setAggregate(null);
          setTodaySessions([]);
        } else {
          console.error('[ScrollGuard] Failed to reset stats:', res?.error);
        }
      });
    } else {
      setStats({ videos: 0, timeMs: 0, sessions: 0 });
      setAggregate(null);
      setTodaySessions([]);
    }
  };

  const handleExport = async () => {
    try {
      let allStorage: Record<string, any> = {};
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        allStorage = await chrome.storage.local.get(null);
      } else {
        // Fallback for development dev-server mode
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            const val = localStorage.getItem(key);
            try {
              allStorage[key] = val ? JSON.parse(val) : null;
            } catch (_) {
              allStorage[key] = val;
            }
          }
        }
      }

      // Filter aggregates
      const aggregates: Record<string, any> = {};
      Object.keys(allStorage).forEach((key) => {
        if (key.startsWith('aggregate_')) {
          aggregates[key] = allStorage[key];
        }
      });

      // Get sessions and video events
      const sessions = await logStorage.getSessions();
      const videoEvents = await logStorage.getVideoEvents();

      const backupData = {
        version: '1.0.0',
        exportedAt: Date.now(),
        todayStats: stats,
        aggregates,
        sessions,
        videoEvents,
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scrollguard_data_${getTodayDateString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[ScrollGuard] Failed to export data:', err);
    }
  };

  const saveVideoLimit = async (val: number) => {
    setVideoLimit(val);
    await extensionStorage.set('daily_video_limit', val);
  };

  const saveTimeLimit = async (val: number) => {
    setTimeLimit(val);
    await extensionStorage.set('daily_time_limit_mins', val);
  };

  const handleOpenDashboard = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url: 'http://localhost:5173' });
    } else {
      window.open('http://localhost:5173', '_blank');
    }
  };

  const todayStr = getTodayDateString();
  const defaultAgg: DailyAggregate = {
    date: todayStr,
    totalVideos: 0,
    totalWatchTimeMs: 0,
    byPlatform: {
      youtube: { count: 0, timeMs: 0 },
      instagram: { count: 0, timeMs: 0 },
      facebook: { count: 0, timeMs: 0 },
      tiktok: { count: 0, timeMs: 0 },
      x: { count: 0, timeMs: 0 },
    },
    byHour: {},
  };
  for (let i = 0; i < 24; i++) defaultAgg.byHour[i] = 0;

  const currentAgg = aggregate || defaultAgg;

  const dopamineInfo = calculateDopamineScore(currentAgg, rollingAvg, todaySessions);
  const speedInfo = calculateScrollSpeed(currentAgg.totalWatchTimeMs, currentAgg.totalVideos);

  const watchMinutes = (stats.timeMs / 60000).toFixed(1);

  // Speed Badge Themes
  const getSpeedStyles = (lvl: string) => {
    switch (lvl) {
      case 'Critical':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'Risky':
        return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case 'Moderate':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    }
  };

  // Rhythm Descriptor
  const getRhythmText = (score: number) => {
    if (score >= 70) return "Accelerated Rhythm — highly repetitive or rapid scrolling patterns observed.";
    if (score >= 35) return "Moderate Rhythm — standard video-watching habits today.";
    return "Balanced Rhythm — healthy gap periods and pacing.";
  };

  const getNeutralPaceExplanation = (lvl: string) => {
    switch (lvl) {
      case 'Critical':
        return "You're scrolling at a highly accelerated speed.";
      case 'Risky':
        return "Your pacing is slightly faster than normal.";
      case 'Moderate':
        return "You're keeping a standard consumption rhythm.";
      default:
        return "Mindful pacing with deliberate watches.";
    }
  };

  // Filter out active platforms
  const activePlatforms = Object.entries(currentAgg.byPlatform).filter(
    ([_, value]) => value.count > 0
  );

  return (
    <div className="w-80 min-h-[460px] bg-slate-950 text-white font-sans flex flex-col justify-between p-5 selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-500 filter drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
          <span className="font-semibold text-sm tracking-wide bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            ScrollGuard
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleExport}
            className="p-1.5 text-slate-500 hover:text-indigo-400 rounded-lg hover:bg-slate-900 transition-all duration-150 cursor-pointer"
            title="Export data to dashboard"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-lg hover:bg-slate-900 transition-all duration-150 cursor-pointer ${
              showSettings ? 'text-indigo-400' : 'text-slate-500 hover:text-indigo-400'
            }`}
            title="Limits & Goals"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-all duration-150 cursor-pointer"
            title="Reset daily logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-4 flex flex-col gap-4">
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-10">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : showSettings ? (
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="text-xs font-bold text-slate-350 uppercase tracking-wider">
                Boundary Settings
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              <div className="bg-slate-900/40 border border-slate-900 p-3.5 rounded-2xl flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-400">Daily Video Count Limit</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={videoLimit}
                    onChange={(e) => saveVideoLimit(Math.max(1, Number(e.target.value)))}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white w-20 focus:outline-none focus:border-indigo-500 text-center font-bold"
                    min="1"
                  />
                  <span className="text-[10px] text-slate-500 font-medium">clips / day</span>
                </div>
                <p className="text-[9px] text-slate-500 leading-normal">
                  Triggers cognitive interventions once you swipe past this count.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-900 p-3.5 rounded-2xl flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-400">Daily Time Limit</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={timeLimit}
                    onChange={(e) => saveTimeLimit(Math.max(1, Number(e.target.value)))}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white w-20 focus:outline-none focus:border-indigo-500 text-center font-bold"
                    min="1"
                  />
                  <span className="text-[10px] text-slate-500 font-medium">minutes / day</span>
                </div>
                <p className="text-[9px] text-slate-500 leading-normal">
                  Halts autopilot usage loops after this cumulative viewing duration.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Dopamine Gauge & Scroll Speed Header */}
            <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-4 flex items-center gap-4">
              {/* Gauge ring */}
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    className="stroke-slate-800"
                    strokeWidth="6.5"
                    fill="transparent"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    className="stroke-indigo-500 drop-shadow-[0_0_5px_rgba(99,102,241,0.5)] transition-all duration-500 ease-out"
                    strokeWidth="6.5"
                    fill="transparent"
                    strokeDasharray={201}
                    strokeDashoffset={201 - (201 * dopamineInfo.total) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-black text-white leading-none">
                    {dopamineInfo.total}
                  </span>
                  <span className="text-[7.5px] uppercase font-bold text-slate-500 tracking-widest mt-0.5">
                    Score
                  </span>
                </div>
              </div>

              {/* Scroll Speed Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                  Scroll Speed
                </p>
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${getSpeedStyles(
                      speedInfo.level
                    )}`}
                  >
                    {speedInfo.level}
                  </span>
                  <span className="text-xs font-medium text-slate-300">
                    {speedInfo.avgSecondsPerVideo.toFixed(1)}s/clip
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal truncate">
                  {getNeutralPaceExplanation(speedInfo.level)}
                </p>
              </div>
            </div>

            {/* General Rhythm Note */}
            <p className="text-[10px] text-slate-400 text-center px-1 leading-relaxed border border-slate-900 bg-slate-950 p-2.5 rounded-xl">
              {getRhythmText(dopamineInfo.total)}
            </p>

            {/* Quick Metrics Columns */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-900/30 border border-slate-900 p-2.5 rounded-xl flex flex-col items-center text-center">
                <Clock className="w-3.5 h-3.5 text-indigo-400 mb-1" />
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                  Duration
                </span>
                <span className="text-sm font-bold text-white mt-0.5">
                  {watchMinutes}m
                </span>
              </div>
              <div className="bg-slate-900/30 border border-slate-900 p-2.5 rounded-xl flex flex-col items-center text-center">
                <Film className="w-3.5 h-3.5 text-purple-400 mb-1" />
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                  Clips
                </span>
                <span className="text-sm font-bold text-white mt-0.5">
                  {stats.videos}
                </span>
              </div>
              <div className="bg-slate-900/30 border border-slate-900 p-2.5 rounded-xl flex flex-col items-center text-center">
                <Layers className="w-3.5 h-3.5 text-pink-400 mb-1" />
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                  Sessions
                </span>
                <span className="text-sm font-bold text-white mt-0.5">
                  {stats.sessions}
                </span>
              </div>
            </div>

            {/* Platform breakdown */}
            {activePlatforms.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-1">
                  Active Platform Pace
                </p>
                <div className="flex flex-col gap-1">
                  {activePlatforms.map(([platform, data]) => {
                    const getPaceLevel = (count: number) => {
                      if (count > 50) return 'Risky';
                      if (count > 25) return 'Moderate';
                      return 'Healthy';
                    };
                    const level = getPaceLevel(data.count);
                    return (
                      <div
                        key={platform}
                        className="flex items-center justify-between bg-slate-900/20 border border-slate-900/80 px-2.5 py-1.5 rounded-lg text-xs"
                      >
                        <span className="capitalize font-semibold text-slate-300">
                          {platform}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-medium">
                            {data.count} clips • {(data.timeMs / 60000).toFixed(1)}m
                          </span>
                          <span
                            className={`px-1.5 py-0.5 text-[8.5px] font-bold rounded ${getSpeedStyles(
                              level
                            )}`}
                          >
                            {level}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer / CTA to Dashboard */}
      <footer className="pt-2 border-t border-slate-900">
        <button
          onClick={handleOpenDashboard}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.98] transition-all duration-155 cursor-pointer"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Open Full Dashboard</span>
        </button>
      </footer>
    </div>
  );
}
