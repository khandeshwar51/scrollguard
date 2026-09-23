import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { calculateScrollSpeed } from '../../../extension/src/shared/analysis/scrollSpeed';
import type { BackupData } from '../shared/types';

interface PlatformsProps {
  data: BackupData;
}

type TimeRange = '7d' | '30d' | 'all';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981'];

export default function Platforms({ data }: PlatformsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  // Filter daily aggregates based on selected time-frame
  const filteredAggregates = Object.values(data.aggregates).filter((agg) => {
    if (timeRange === 'all') return true;
    const aggTime = new Date(agg.date).getTime();
    const now = Date.now();
    const days = timeRange === '7d' ? 7 : 30;
    return aggTime >= now - days * 24 * 60 * 60 * 1000;
  });

  // Filter sessions based on selected time-frame
  const filteredSessions = (data.sessions || []).filter((s) => {
    if (timeRange === 'all') return true;
    const now = Date.now();
    const days = timeRange === '7d' ? 7 : 30;
    return s.startTime >= now - days * 24 * 60 * 60 * 1000;
  });

  // 1. Calculate stats per platform from filtered aggregates
  const platformStats: Record<string, { count: number; timeMs: number }> = {
    youtube: { count: 0, timeMs: 0 },
    instagram: { count: 0, timeMs: 0 },
    facebook: { count: 0, timeMs: 0 },
    tiktok: { count: 0, timeMs: 0 },
    x: { count: 0, timeMs: 0 },
  };

  filteredAggregates.forEach((agg) => {
    Object.entries(agg.byPlatform).forEach(([plat, stats]) => {
      if (platformStats[plat]) {
        platformStats[plat].count += stats.count;
        platformStats[plat].timeMs += stats.timeMs;
      }
    });
  });

  // Calculate platform share data for PieChart
  const totalClips = Object.values(platformStats).reduce((acc, curr) => acc + curr.count, 0);
  const pieData = Object.entries(platformStats)
    .filter(([_, stats]) => stats.count > 0)
    .map(([platform, stats]) => ({
      name: platform.toUpperCase(),
      value: stats.count,
      percentage: totalClips > 0 ? Math.round((stats.count / totalClips) * 100) : 0,
    }));

  // Calculate binge stats
  const bingeSessions = filteredSessions.filter((s) => s.endTime - s.startTime > 25 * 60 * 1000);
  const bingeCount = bingeSessions.length;
  
  const platformBingeCount: Record<string, number> = {};
  bingeSessions.forEach((s) => {
    platformBingeCount[s.platform] = (platformBingeCount[s.platform] || 0) + 1;
  });

  let dominantBingePlatform = '';
  let maxBinges = 0;
  Object.entries(platformBingeCount).forEach(([plat, count]) => {
    if (count > maxBinges) {
      maxBinges = count;
      dominantBingePlatform = plat;
    }
  });

  const getPaceBadgeStyles = (level: string) => {
    switch (level) {
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

  const renderFilterPills = () => (
    <div className="flex items-center bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs">
      {(['7d', '30d', 'all'] as const).map((range) => {
        const label = range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'All Time';
        const isActive = timeRange === range;
        return (
          <button
            key={range}
            type="button"
            onClick={() => setTimeRange(range)}
            className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-950/20 select-none">
      <div className="flex flex-col gap-6 max-w-6xl mx-auto">
        {/* Top Header Card with Filter Controls */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white">Platform Pace Analysis</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluate your swipe frequency and scroll pace across social video feeds.
            </p>
          </div>
          {renderFilterPills()}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pie Chart Card */}
        <div className="lg:col-span-1 bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Share Distribution
            </h3>
            <h4 className="text-lg font-bold text-white mt-0.5">Platform Video Share</h4>
          </div>

          <div className="w-full h-56 my-4">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                No active platforms recorded.
              </div>
            )}
          </div>

          {/* Simple Custom Legend */}
          <div className="flex flex-col gap-1.5 text-xs text-slate-400 mt-2">
            {pieData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="capitalize">{item.name.toLowerCase()}</span>
                </div>
                <span className="font-semibold text-white">
                  {item.value} clips ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Platforms table and Insights */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Pace Table */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Platform Pace Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-2.5 pl-1">Platform</th>
                    <th className="py-2.5 text-right">Clips</th>
                    <th className="py-2.5 text-right">Duration</th>
                    <th className="py-2.5 text-right">Avg Pace</th>
                    <th className="py-2.5 pr-1 text-right">Pace Category</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300 font-medium">
                  {Object.entries(platformStats).map(([plat, stats]) => {
                    const speed = calculateScrollSpeed(stats.timeMs, stats.count);
                    const level = speed.level;
                    const hours = Math.floor(stats.timeMs / 3600000);
                    const mins = Math.round((stats.timeMs % 3600000) / 60000);

                    return (
                      <tr key={plat} className="border-b border-slate-900/40 hover:bg-slate-900/10">
                        <td className="py-3 capitalize pl-1 text-white font-bold">{plat}</td>
                        <td className="py-3 text-right">{stats.count}</td>
                        <td className="py-3 text-right">
                          {hours > 0 ? `${hours}h ` : ''}
                          {mins}m
                        </td>
                        <td className="py-3 text-right">
                          {speed.avgSecondsPerVideo.toFixed(1)}s/video
                        </td>
                        <td className="py-3 pr-1 text-right">
                          <span
                            className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${getPaceBadgeStyles(
                              level
                            )}`}
                          >
                            {level}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Platform Insights */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Behavioral Insights
            </h3>
            <p className="text-sm font-semibold text-white mb-2">Platform Dominance Analysis</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              {bingeCount > 0
                ? `You've logged ${bingeCount} binge sessions (>25 mins) across this history, mostly on ${
                    dominantBingePlatform.charAt(0).toUpperCase() + dominantBingePlatform.slice(1)
                  }.`
                : "Excellent control! You haven't triggered any continuous binge sessions exceeding 25 minutes."}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed mt-2">
              Short-form players use variable-ratio schedules to trigger repetitive checks. Keeping the
              ScrollGuard floating widget active on your dominant platforms helps anchor your cognitive awareness
              and slow down swiping patterns.
            </p>
          </div>

        </div>

      </div>
    </div>
    </div>
  );
}
