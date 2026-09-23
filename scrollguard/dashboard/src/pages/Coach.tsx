import { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, Activity, Heart, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { calculateDopamineScore } from '../../../extension/src/shared/analysis/dopamineScore';
import { analyzeTriggerPatterns, detectDoomscroll } from '../../../extension/src/shared/analysis/behavior';
import type { BackupData } from '../shared/types';

interface CoachProps {
  data: BackupData;
}

interface CoachReport {
  summary: string;
  topInsight: string;
  oneActionSuggestion: string;
  encouragement: string;
}

export default function Coach({ data }: CoachProps) {
  const [prediction, setPrediction] = useState<string | null>(null);
  const [report, setReport] = useState<CoachReport | null>(null);
  const [_, setLoadingPredict] = useState(false);
  const [loadingReport, setLoadingReport] = useState<'daily' | 'weekly' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Calculate active stats for Today or the last logged aggregate
  const getLatestStats = () => {
    const sortedDates = Object.keys(data.aggregates).sort();
    const latestDate = sortedDates[sortedDates.length - 1];
    const aggregate = data.aggregates[latestDate] || {
      date: new Date().toISOString().split('T')[0],
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

    // Calculate doomscroll counts for today's sessions
    const todaySessions = data.sessions.filter((s) => {
      const d = new Date(s.startTime);
      const sDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return sDate === latestDate;
    });

    const doomscrollCount = todaySessions.filter((s) => detectDoomscroll(s as any).isDoomscrolling).length;

    // Estimate daily rolling average baseline (default: 50 clips)
    const totalVids = Object.values(data.aggregates).reduce((sum, curr) => sum + curr.totalVideos, 0);
    const totalDays = Object.keys(data.aggregates).length || 1;
    const rollingAvg = totalVids / totalDays;

    const dopamineScore = calculateDopamineScore(aggregate as any, rollingAvg, todaySessions as any).total;

    return {
      aggregate,
      dopamineScore,
      doomscrollCount,
    };
  };

  // Calculate stats for the last 7 logged days
  const getWeeklyStats = () => {
    const sortedDates = Object.keys(data.aggregates).sort();
    const last7Dates = sortedDates.slice(-7);
    const aggregatesList = last7Dates.map((d) => data.aggregates[d]);

    // Average weekly dopamine
    let totalDopamine = 0;
    let totalDoomscrolls = 0;

    last7Dates.forEach((dateStr) => {
      const agg = data.aggregates[dateStr];
      const sList = data.sessions.filter((s) => {
        const d = new Date(s.startTime);
        const sDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return sDate === dateStr;
      });

      const dCount = sList.filter((s) => detectDoomscroll(s as any).isDoomscrolling).length;
      totalDoomscrolls += dCount;

      const totalVids = Object.values(data.aggregates).reduce((sum, curr) => sum + curr.totalVideos, 0);
      const totalDays = Object.keys(data.aggregates).length || 1;
      const rollingAvg = totalVids / totalDays;

      totalDopamine += calculateDopamineScore(agg as any, rollingAvg, sList as any).total;
    });

    return {
      aggregates: aggregatesList,
      avgDopamineScore: last7Dates.length > 0 ? totalDopamine / last7Dates.length : 0,
      totalDoomscrollSessions: totalDoomscrolls,
    };
  };

  // 2. Fetch AI habit prediction on load (cache per session)
  useEffect(() => {
    const fetchPrediction = async () => {
      setLoadingPredict(true);
      setErrorMsg(null);
      
      const triggerPatterns = analyzeTriggerPatterns(data.sessions as any);
      
      try {
        const res = await fetch('http://127.0.0.1:3000/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            triggerPatterns,
            currentHour: new Date().getHours(),
            currentDay: new Date().getDay(),
          }),
        });

        if (res.ok) {
          const result = await res.json();
          setPrediction(result.prediction);
        } else {
          console.warn('[ScrollGuard Coach] Failed to fetch prediction banner from backend');
        }
      } catch (err: any) {
        console.warn('[ScrollGuard Coach] Local server is offline. Falling back to offline client mode.', err);
      } finally {
        setLoadingPredict(false);
      }
    };

    fetchPrediction();
  }, [data.sessions]);

  // 3. Generate Coach Analysis reports
  const generateReport = async (type: 'daily' | 'weekly') => {
    setLoadingReport(type);
    setErrorMsg(null);
    setReport(null);

    const payload = type === 'daily' ? getLatestStats() : getWeeklyStats();

    try {
      const endpoint = type === 'daily' ? 'daily' : 'weekly';
      const res = await fetch(`http://127.0.0.1:3000/api/coach/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();
        setReport(result);
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error || 'Failed to generate report');
      }
    } catch (err: any) {
      setErrorMsg('Could not reach ScrollGuard backend. Please verify your local node server is running (npm run dev in backend directory).');
      console.error('[ScrollGuard Coach] Error reaching backend:', err);
    } finally {
      setLoadingReport(null);
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-950/20 select-none">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">

        {/* Prediction Nudge Banner */}
        {prediction && (
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 p-4 rounded-2xl flex items-center gap-3.5 shadow-lg shadow-indigo-950/5 animate-pulse">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-black">AI Predictive Nudge</p>
              <p className="text-xs font-semibold text-slate-200 mt-0.5">{prediction}</p>
            </div>
          </div>
        )}

        {/* Action Panel */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                <h3 className="text-base font-bold text-white">AI Coach Consultation</h3>
              </div>
              <p className="text-xs text-slate-400 max-w-xl">
                Consult with AI Coach (powered by Groq / Claude) to analyze aggregate statistics, identify scrolling traps, and outline supportive habit actions.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => generateReport('daily')}
                disabled={loadingReport !== null}
                className="px-4 py-2 bg-slate-900 border border-slate-800 text-xs font-bold text-slate-350 hover:text-white rounded-xl active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
              >
                {loadingReport === 'daily' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Daily Consultation
              </button>
              <button
                onClick={() => generateReport('weekly')}
                disabled={loadingReport !== null}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white rounded-xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
              >
                {loadingReport === 'weekly' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Weekly Analysis
              </button>
            </div>
          </div>
        </div>

        {/* Error Dialog */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-rose-350 leading-relaxed">
              <span className="font-bold">Consultation Error:</span>
              <p className="mt-1">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Consultation Outputs */}
        {loadingReport && (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider animate-pulse">
              Consulting AI Coach...
            </p>
          </div>
        )}

        {report && !loadingReport && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {/* Summary */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-4 h-4 text-pink-400" />
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Coach Feedback</span>
              </div>
              <p className="text-sm font-semibold text-white mb-2 leading-snug">Summary</p>
              <p className="text-xs text-slate-350 leading-relaxed">{report.summary}</p>
            </div>

            {/* Top Insight */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-3">
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Behavior Insight</span>
              </div>
              <p className="text-sm font-semibold text-white mb-2 leading-snug">Key Habit Observation</p>
              <p className="text-xs text-slate-350 leading-relaxed">{report.topInsight}</p>
            </div>

            {/* Action Item */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-3">
                <ArrowRight className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Mindful Prompt</span>
              </div>
              <p className="text-sm font-semibold text-white mb-2 leading-snug">Recommended Action</p>
              <p className="text-xs text-slate-350 leading-relaxed">{report.oneActionSuggestion}</p>
            </div>

            {/* Encouragement */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Encouragement</span>
              </div>
              <p className="text-sm font-semibold text-white mb-2 leading-snug">Goal Alignment</p>
              <p className="text-xs text-slate-350 leading-relaxed">{report.encouragement}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
