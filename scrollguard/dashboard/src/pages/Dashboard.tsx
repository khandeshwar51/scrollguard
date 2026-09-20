import { Clock, Film, RefreshCw, AlertTriangle } from 'lucide-react';
import AggregateChart from '../charts/AggregateChart';

export default function Dashboard() {
  const stats = [
    {
      title: 'Total Watch Time',
      value: '2h 24m',
      change: '+14% from yesterday',
      icon: Clock,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Shorts Watched',
      value: '142 videos',
      change: '+22% from yesterday',
      icon: Film,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      title: 'Completion Rate',
      value: '38.4%',
      change: '-5% loop completed',
      icon: RefreshCw,
      color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    },
    {
      title: 'Doomscroll Warning',
      value: 'Level: High',
      change: 'Youtube Shorts peak loop',
      icon: AlertTriangle,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-950/20 select-none">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md hover:border-slate-700/50 hover:shadow-xl hover:shadow-slate-950/25 transition-all duration-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  {stat.title}
                </p>
                <h2 className="text-3xl font-bold text-white mt-2">
                  {stat.value}
                </h2>
              </div>
              <div className={`p-3 rounded-xl border ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4 font-medium">
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Main Chart Section */}
      <div className="grid grid-cols-1 gap-6">
        <AggregateChart />
      </div>
    </div>
  );
}
