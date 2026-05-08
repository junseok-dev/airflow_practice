import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function WeeklyActivityChart({ data }) {
  return (
    <section className="panel">
      <div className="panel__header">
        <h2>주차별 학습 활동</h2>
        <span>표본 클릭 추세</span>
      </div>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 18, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="weekLabel" tickLine={false} axisLine={false} minTickGap={18} />
            <YAxis tickLine={false} axisLine={false} width={62} />
            <Tooltip cursor={{ stroke: '#94a3b8', strokeWidth: 1 }} />
            <Line
              type="monotone"
              dataKey="totalClicks"
              name="총 클릭"
              stroke="#0f766e"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
