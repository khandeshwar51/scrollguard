import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const mockData = [
  { hour: '00:00', watchTimeMin: 12 },
  { hour: '03:00', watchTimeMin: 5 },
  { hour: '06:00', watchTimeMin: 2 },
  { hour: '09:00', watchTimeMin: 15 },
  { hour: '12:00', watchTimeMin: 45 },
  { hour: '15:00', watchTimeMin: 20 },
  { hour: '18:00', watchTimeMin: 60 },
  { hour: '21:00', watchTimeMin: 85 },
];

export default function AggregateChart() {
  return (
    <div className="w-full h-80 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Daily Activity Profile
          </h3>
          <p className="text-2xl font-bold text-white mt-1">Watch Time by Hour</p>
        </div>
        <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          Peak: 21:00 (85 mins)
        </span>
      </div>

      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={mockData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorWatchTime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#c084fc" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
            <XAxis
              dataKey="hour"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              unit="m"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
              }}
              labelClassName="text-slate-400"
            />
            <Area
              type="monotone"
              dataKey="watchTimeMin"
              stroke="#6366f1"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorWatchTime)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
