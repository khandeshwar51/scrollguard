import { useState } from 'react';
import { AlertTriangle, Layers } from 'lucide-react';
import type { BackupData } from '../shared/types';

interface HeatmapProps {
  data: BackupData;
}

type TimeRange = '7d' | '30d' | 'all';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function Heatmap({ data }: HeatmapProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  // Filter video events based on selected time-frame
  const filteredEvents = (data.videoEvents || []).filter((event) => {
    if (timeRange === 'all') return true;
    const now = Date.now();
    const days = timeRange === '7d' ? 7 : 30;
    return event.startTime >= now - days * 24 * 60 * 60 * 1000;
  });

  // Check if we have enough real video events to compile a meaningful heatmap
  const hasEnoughData = filteredEvents.length >= 5;

  // 1. Build Day x Hour matrix of video count
  const matrix: number[][] = Array(7)
    .fill(0)
    .map(() => Array(24).fill(0));

  if (hasEnoughData) {
    filteredEvents.forEach((event) => {
      const d = new Date(event.startTime);
      const day = d.getDay(); // 0 to 6
      const hour = d.getHours(); // 0 to 23
      matrix[day][hour] += 1;
    });
  }

  // Find max value in matrix for scaling
  const maxVal = Math.max(...matrix.map((row) => Math.max(...row)), 1);

  // 2. Identify busiest hour
  const hourTotals = Array(24).fill(0);
  for (let h = 0; h < 24; h++) {
    for (let d = 0; d < 7; d++) {
      hourTotals[h] += matrix[d][h];
    }
  }
  const peakHour = hourTotals.indexOf(Math.max(...hourTotals));
  const formatHourString = (h: number) => {
    const start = h % 12 === 0 ? 12 : h % 12;
    const startAmPm = h >= 12 ? 'PM' : 'AM';
    const end = (h + 1) % 12 === 0 ? 12 : (h + 1) % 12;
    const endAmPm = h + 1 >= 12 && h + 1 < 24 ? 'PM' : 'AM';
    return `${start}${startAmPm}–${end}${endAmPm}`;
  };

  // 3. Identify lightest day
  const dayTotals = matrix.map((row) => row.reduce((a, b) => a + b, 0));
  // Filter out days with 0 records just in case
  const activeDayTotals = dayTotals.map((tot, idx) => ({ tot, idx }));
  const lightestDayIdx = activeDayTotals.reduce(
    (min, curr) => (curr.tot > 0 && curr.tot < min.tot ? curr : min),
    { tot: Infinity, idx: 3 } // Default Wednesday
  ).idx;

  // 4. Color interpolation function (Calm blue-to-amber, rose for extreme outliers)
  const getCellColor = (val: number) => {
    if (val === 0) return 'rgba(30, 41, 59, 0.4)'; // slate 800 transparent
    const ratio = val / maxVal;
    
    if (ratio < 0.25) {
      return 'rgba(59, 130, 246, 0.25)'; // Light blue
    } else if (ratio < 0.5) {
      return 'rgba(59, 130, 246, 0.55)'; // Mid blue
    } else if (ratio < 0.75) {
      return 'rgba(245, 158, 11, 0.65)'; // Amber/Orange
    } else if (ratio < 0.9) {
      return 'rgba(245, 158, 11, 0.95)'; // Intense Amber
    } else {
      return 'rgba(244, 63, 94, 0.95)'; // Rose (Extreme Outlier)
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

  // If there is not enough browsing history, display a friendly empty state with filter intact
  if (!hasEnoughData) {
    return (
      <div className="flex-1 p-8 overflow-y-auto bg-slate-950/20 select-none">
        <div className="flex flex-col gap-6 max-w-3xl mx-auto">
          {/* Header Summary with Filter Controls */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Addiction Heatmap</h3>
                <p className="text-xs text-slate-400">
                  Analyze your hourly scrolling density and identify your highest trigger windows.
                </p>
              </div>
            </div>
            {renderFilterPills()}
          </div>

          {/* Empty State Card */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-12 backdrop-blur-md text-center flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">
              {timeRange === 'all'
                ? 'Weekly Hotspots Pending'
                : `Not enough data in the ${timeRange === '7d' ? 'Last 7 Days' : 'Last 30 Days'}`}
            </h4>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              At least 5 recorded clips are needed to build the circadian heatmap for this period. Try switching to &quot;Last 30 Days&quot; or &quot;All Time&quot; above to view your full history.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-950/20 select-none">
      <div className="flex flex-col gap-6 max-w-6xl mx-auto">
        
        {/* Heatmap Grid Card */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Behavioral Hotspots
              </h3>
              <h4 className="text-lg font-bold text-white mt-0.5">Weekly Scroll Heatmap</h4>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {renderFilterPills()}

              {/* Color Legend */}
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span>None</span>
                <div className="w-3.5 h-3.5 rounded bg-slate-800" />
                <div className="w-3.5 h-3.5 rounded bg-blue-500/30" />
                <div className="w-3.5 h-3.5 rounded bg-blue-500/60" />
                <div className="w-3.5 h-3.5 rounded bg-amber-500/70" />
                <div className="w-3.5 h-3.5 rounded bg-rose-500/90" />
                <span>Peak</span>
              </div>
            </div>
          </div>

          {/* Grid Layout Container */}
          <div className="overflow-x-auto">
            <div className="min-w-[760px] flex flex-col gap-1">
              
              {/* Hour Header */}
              <div className="flex items-center mb-1 text-[9px] font-bold text-slate-500 tracking-wider text-center">
                <div className="w-20 flex-shrink-0 text-left pl-1">DAY</div>
                <div className="flex-1 grid grid-cols-24 gap-1">
                  {HOURS.map((h) => (
                    <div key={h} title={`${h}:00`}>
                      {String(h).padStart(2, '0')}
                    </div>
                  ))}
                </div>
              </div>

              {/* Day Rows */}
              {WEEKDAYS.map((dayName, dayIdx) => (
                <div key={dayName} className="flex items-center text-xs">
                  {/* Day Label */}
                  <div className="w-20 flex-shrink-0 text-slate-400 font-semibold text-left pl-1">
                    {dayName.substring(0, 3)}
                  </div>
                  {/* Grid cells */}
                  <div className="flex-1 grid grid-cols-24 gap-1">
                    {HOURS.map((hour) => {
                      const val = matrix[dayIdx][hour];
                      return (
                        <div
                          key={hour}
                          style={{ backgroundColor: getCellColor(val) }}
                          className="aspect-square w-full rounded transition-all duration-150 hover:scale-110 hover:shadow-lg hover:shadow-slate-950 border border-slate-950/20"
                          title={`${dayName}, ${hour}:00 - ${hour + 1}:00: ${val} clips`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Heatmap Insights */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-md">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Automated Heatmap Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-900/80 flex flex-col justify-center">
              <p className="text-slate-500 font-bold uppercase tracking-wider text-[9px] mb-1">
                Busiest Scroll Window
              </p>
              <p className="text-sm font-semibold text-white">
                Your busiest scrolling hours are between {formatHourString(peakHour)}.
              </p>
              <p className="text-slate-400 mt-2 leading-relaxed">
                Compulsive scrolling behaviors are usually concentrated during this period. Taking a
                deliberate 15-minute screen break right before this hour starts can break the trigger loop.
              </p>
            </div>

            <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-900/80 flex flex-col justify-center">
              <p className="text-slate-500 font-bold uppercase tracking-wider text-[9px] mb-1">
                Mindful Scroll Window
              </p>
              <p className="text-sm font-semibold text-white">
                {WEEKDAYS[lightestDayIdx]}s tend to be your lightest days.
              </p>
              <p className="text-slate-400 mt-2 leading-relaxed">
                On these days, your consumption pace naturally drops. Take note of what environmental factors
                or routines you have on {WEEKDAYS[lightestDayIdx]}s that keep you present.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
