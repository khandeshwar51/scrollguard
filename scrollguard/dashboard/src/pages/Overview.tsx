import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Film, RefreshCw, AlertTriangle, BrainCircuit } from 'lucide-react';
import type { BackupData } from '../shared/types';
import { analyzeTriggerPatterns } from '../../../extension/src/shared/analysis/behavior';

interface OverviewProps {
  data: BackupData;
  isMock: boolean;
}

export default function Overview({ data, isMock }: OverviewProps) {
  const patterns = analyzeTriggerPatterns(data.sessions);

  // 1. Calculate stats from aggregates & events
  const totalWatchTimeMs = Object.values(data.aggregates).reduce(
    (acc, curr) => acc + curr.totalWatchTimeMs,
    0
  );
  const watchHours = Math.floor(totalWatchTimeMs / 3600000);
  const watchMins = Math.round((totalWatchTimeMs % 3600000) / 60000);
  const totalClips = Object.values(data.aggregates).reduce(
    (acc, curr) => acc + curr.totalVideos,
    0
  );

  const totalCompleted = data.videoEvents.filter((e) => e.completed).length;
  const completionRate =
    data.videoEvents.length > 0
      ? Math.round((totalCompleted / data.videoEvents.length) * 1000) / 10
      : 0;

  const bingeSessions = data.sessions.filter(
    (s) => s.endTime - s.startTime > 25 * 60 * 1000
  );
  const bingeCount = bingeSessions.length;

  // 2. Prep monthly data (past 6 months)
  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyHrs: Record<string, number> = {};

    Object.values(data.aggregates).forEach((agg) => {
      const d = new Date(agg.date);
      const mName = months[d.getMonth()];
      monthlyHrs[mName] = (monthlyHrs[mName] || 0) + agg.totalWatchTimeMs / 3600000;
    });

    const chartData = [];
    const currentMonthIdx = new Date().getMonth();

    // Pull last 6 months
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonthIdx - i + 12) % 12;
      const mName = months[idx];
      // If we don't have this month's data, fill with a realistic base for visualization
      const baseHrs = isMock ? 8 + Math.random() * 12 : 0;
      const hours = monthlyHrs[mName] !== undefined ? monthlyHrs[mName] : baseHrs;

      chartData.push({
        month: mName,
        Hours: Math.round(hours * 10) / 10,
      });
    }

    return chartData;
  };

  const monthlyData = getMonthlyData();

  // 3. Automated Insight Card Generator
  const getInsightText = () => {
    const rateText =
      completionRate < 40
        ? `Your video completion rate is quite low (${completionRate}%), indicating a high rate of quick swiping for dopamine triggers.`
        : `Your video completion rate is steady (${completionRate}%), suggesting you complete more of the videos you click.`;

    const bingeText =
      bingeCount > 0
        ? `You had ${bingeCount} binge sessions (>25 mins) logged, which are associated with variable-ratio scroll feedback loops.`
        : `No excessive binge sessions (>25 mins) logged so far. That helps maintain stable dopamine baselines!`;

    return {
      rate: rateText,
      binge: bingeText,
    };
  };

  const insights = getInsightText();

  const cards = [
    {
      title: 'Cumulative Watch Time',
      value: `${watchHours}h ${watchMins}m`,
      desc: 'Total logged screen time across all platforms',
      icon: Clock,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Videos Swiped',
      value: `${totalClips} clips`,
      desc: 'Count of video segments evaluated',
      icon: Film,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      title: 'Avg Completion Rate',
      value: `${completionRate}%`,
      desc: 'Percentage of clips viewed to full duration',
      icon: RefreshCw,
      color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    },
    {
      title: 'Binge Sessions',
      value: `${bingeCount} loops`,
      desc: 'Continuous watching periods exceeding 25 min',
      icon: AlertTriangle,
      color:
        bingeCount > 5
          ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
          : 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-950/20 select-none">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, i) => (
          <div
            key={i}
            className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-md hover:border-slate-800 transition-all duration-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  {card.title}
                </p>
                <h2 className="text-2xl font-bold text-white mt-2 leading-none">
                  {card.value}
                </h2>
              </div>
              <div className={`p-2.5 rounded-xl border ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4 leading-normal font-medium">
              {card.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-md">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Circadian Consumption Trend
            </h3>
            <p className="text-lg font-bold text-white mt-1 mb-6">Watch Time - Last 6 Months</p>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.2} />
                <XAxis
                  dataKey="month"
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  unit="h"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Bar
                  dataKey="Hours"
                  fill="url(#colorHours)"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insights Panel */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Automated Analysis
            </h3>
            <h4 className="text-base font-bold text-white mt-1 mb-4">Habit Insights</h4>

            <div className="flex flex-col gap-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-900">
                <p className="font-semibold text-slate-400 mb-1">Completion Rhythm</p>
                <p>{insights.rate}</p>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-900">
                <p className="font-semibold text-slate-400 mb-1">Compulsive loops</p>
                <p>{insights.binge}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-900/60 flex items-center justify-between text-xs text-slate-400">
            <span>Data source: Local User Backup</span>
          </div>
        </div>
      </div>

      {/* AI Trigger Patterns Section */}
      <div className="mt-6 bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-4">
          <BrainCircuit className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            AI Trigger Pattern Analysis
          </h3>
        </div>

        {patterns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {patterns.map((pat, idx) => (
              <div key={idx} className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[9px] font-bold rounded-full uppercase">
                      Confidence: {Math.round(pat.confidence * 100)}%
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {pat.occurrences} matches
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {pat.pattern}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 leading-normal pl-1 font-medium">
            Pacing patterns are being analyzed. Once we observe consistent trends (at least 5 matching occurrences), they will be cataloged here.
          </p>
        )}
      </div>
    </div>
  );
}
