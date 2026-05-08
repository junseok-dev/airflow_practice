import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export default function CompetencyRadarChart({ data }) {
  return (
    <section className="panel">
      <div className="panel__header">
        <h2>평균 역량 프로필</h2>
        <span>0-100 점수</span>
      </div>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="74%">
            <PolarGrid stroke="#dbe3ef" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#526071', fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip />
            <Radar
              dataKey="score"
              name="평균 점수"
              stroke="#7c3aed"
              fill="#7c3aed"
              fillOpacity={0.18}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
