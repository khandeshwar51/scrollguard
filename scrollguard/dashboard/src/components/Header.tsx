import { WifiOff, Upload } from 'lucide-react';
import type { ChangeEvent } from 'react';
import type { BackupData } from '../shared/types';

interface HeaderProps {
  activeRoute: string;
  onUpload: (data: BackupData) => void;
  isMock: boolean;
}

export default function Header({ activeRoute, onUpload, isMock }: HeaderProps) {
  const getHeaderTitle = (route: string) => {
    switch (route) {
      case 'overview':
        return {
          title: 'Overview Dashboard',
          subtitle: 'Daily video tracking, completion summaries, and rolling averages.',
        };
      case 'heatmap':
        return {
          title: 'Addiction Heatmap',
          subtitle: 'Hourly scroll distributions mapped across weekdays to isolate binge spikes.',
        };
      case 'platforms':
        return {
          title: 'Platform Pace Analysis',
          subtitle: 'Platform metrics distribution and average swiping speeds.',
        };
      case 'sessions':
        return {
          title: 'Session Timeline Logs',
          subtitle: 'Timeline list of daily sessions with warnings for long binge periods.',
        };
      default:
        return {
          title: 'ScrollGuard Dashboard',
          subtitle: 'Welcome to your wellbeing command panel.',
        };
    }
  };

  const { title, subtitle } = getHeaderTitle(activeRoute);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.version && json.aggregates && json.sessions) {
          onUpload(json as BackupData);
        } else {
          alert('Invalid ScrollGuard data format. Make sure it is an exported extension backup.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <header className="h-20 border-b border-slate-900 bg-slate-950/40 backdrop-blur-md px-8 flex items-center justify-between select-none">
      {/* Title */}
      <div>
        <h1 className="text-lg font-bold text-white tracking-wide">{title}</h1>
        <p className="text-[11px] text-slate-500 font-medium mt-0.5">{subtitle}</p>
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-4">
        {/* Active Source indicator */}
        {isMock ? (
          <div className="flex items-center gap-1.5 py-1 px-3 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-semibold text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Demo Data Mode</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 py-1 px-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-semibold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Live Backup Active</span>
          </div>
        )}

        {/* Local Storage Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 py-1 px-3 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-semibold text-indigo-400">
          <WifiOff className="w-3 h-3" />
          <span>Local Only</span>
        </div>

        {/* Drop zone / File Select */}
        <label className="flex items-center gap-1.5 py-1 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-[10px] font-bold text-slate-300 hover:text-white cursor-pointer transition-all duration-150">
          <Upload className="w-3 h-3" />
          <span>Import JSON</span>
          <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
        </label>

        {/* Profile */}
        <div className="flex items-center gap-2 border-l border-slate-900 pl-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-xs shadow-md">
            U
          </div>
        </div>
      </div>
    </header>
  );
}
