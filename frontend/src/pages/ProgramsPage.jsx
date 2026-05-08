import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  LabelList,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';

import { fetchPrograms } from '../api/dashboardApi.js';
import { SkeletonChartGrid } from '../components/common/Skeleton.jsx';
import AppHeader from '../components/layout/AppHeader.jsx';

const MODULE_COLORS = {
  AAA: '#2563eb',
  BBB: '#0f766e',
  CCC: '#7c3aed',
  DDD: '#d97706',
  EEE: '#dc2626',
  FFF: '#0891b2',
  GGG: '#65a30d',
};

function fmt1(v) {
  return Number(v ?? 0).toFixed(1);
}

// 각 바를 프로그램 고유 색상으로 렌더링
function ProgramBar({ x, y, width, height, code_module }) {
  if (!height || height <= 0) return null;
  const fill = MODULE_COLORS[code_module] ?? '#2563eb';
  return <rect x={x} y={y} width={width} height={Math.max(0, height)} fill={fill} rx={5} ry={5} />;
}

function RankBadge({ rank }) {
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
  if (medals[rank]) return <span style={{ fontSize: 18 }}>{medals[rank]}</span>;
  return <span style={{ color: '#94a3b8', fontWeight: 700 }}>{rank}</span>;
}

function ScatterDot(props) {
  const { cx, cy, payload } = props;
  const r = Math.sqrt((props.zAxis?.range?.[0] ?? 400) + (payload.avg_competency_score / 100) * 800) / Math.PI * 4;
  const color = MODULE_COLORS[payload.code_module] ?? '#2563eb';
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={color} fillOpacity={0.72} stroke={color} strokeWidth={2} />
      <text x={cx} y={cy - r - 6} textAnchor="middle" fill="#172033" fontSize={13} fontWeight={700}>
        {payload.code_module}
      </text>
    </g>
  );
}

function ScatterTooltipContent({ payload }) {
  if (!payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: '#fff', border: '1px solid #dfe7f2', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
      <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#172033' }}>{d.code_module}</p>
      <p style={{ margin: '2px 0', color: '#526071' }}>수강생: {d.total_students.toLocaleString('ko-KR')}명</p>
      <p style={{ margin: '2px 0', color: '#526071' }}>합격률: {d.pass_rate}%</p>
      <p style={{ margin: '2px 0', color: '#526071' }}>평균 역량: {d.avg_competency_score}</p>
    </div>
  );
}

const SORT_OPTIONS = [
  { label: '합격률', value: 'pass_rate' },
  { label: '평균 역량', value: 'avg_competency_score' },
  { label: '평균 평가', value: 'avg_assessment_score' },
  { label: '고위험 비율 ↑', value: 'high_risk_rate' },
  { label: '이탈률 ↑', value: 'withdrawal_rate' },
];

const LABEL_STYLE = { fontSize: 11, fontWeight: 700, fill: '#526071' };

export default function ProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [sortKey, setSortKey] = useState('pass_rate');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPrograms()
      .then(setPrograms)
      .then(() => setStatus('success'))
      .catch((err) => { setError(err.message); setStatus('error'); });
  }, []);

  useEffect(() => { document.title = '프로그램 비교 | 교육생 역량 분석'; }, []);

  // 각 차트마다 해당 지표 기준으로 정렬
  const byPassRate    = useMemo(() => [...programs].sort((a, b) => b.pass_rate - a.pass_rate), [programs]);
  const byRisk        = useMemo(() => [...programs].sort((a, b) => a.withdrawal_rate - b.withdrawal_rate), [programs]);
  const byCompetency  = useMemo(() => [...programs].sort((a, b) => b.avg_competency_score - a.avg_competency_score), [programs]);
  const byAssessment  = useMemo(() => [...programs].sort((a, b) => b.avg_assessment_score - a.avg_assessment_score), [programs]);
  const byEngagement  = useMemo(() => [...programs].sort((a, b) => b.avg_engagement_score - a.avg_engagement_score), [programs]);
  const byDiligence   = useMemo(() => [...programs].sort((a, b) => b.avg_diligence_score - a.avg_diligence_score), [programs]);
  const sorted        = useMemo(() => [...programs].sort((a, b) => b[sortKey] - a[sortKey]), [programs, sortKey]);

  if (status === 'loading') {
    return (
      <main className="app-shell">
        <AppHeader />
        <SkeletonChartGrid />
      </main>
    );
  }
  if (status === 'error') {
    return <main className="app-shell"><AppHeader /><div className="state-box state-box--error">{error}</div></main>;
  }

  return (
    <main className="app-shell">
      <AppHeader />

      <div className="page-toolbar">
        <Link className="text-link" to="/">대시보드로 돌아가기</Link>
      </div>

      <div className="programs-header">
        <div>
          <p className="eyebrow">Program Analytics</p>
          <h1 style={{ margin: 0 }}>프로그램별 성과 비교</h1>
        </div>
      </div>

      {/* 프로그램 색상 범례 */}
      <div className="program-legend">
        {Object.entries(MODULE_COLORS).map(([module, color]) => (
          <span key={module} className="program-legend__item">
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
            {module}
          </span>
        ))}
        <span className="program-legend__note">차트 색상은 프로그램을 나타냄 · 각 차트는 해당 지표 기준 정렬</span>
      </div>

      <section className="dashboard-grid" style={{ marginTop: 12, gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>

        {/* 행 1: 합격률 / 이탈률 vs 고위험 / 종합 역량 */}
        <section className="panel">
          <div className="panel__header">
            <div><h2>합격률 비교</h2><span>높을수록 좋음 · 내림차순</span></div>
          </div>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byPassRate} margin={{ top: 24, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="code_module" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={40} unit="%" domain={[0, 100]} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="pass_rate" name="합격률" shape={<ProgramBar />}>
                  <LabelList dataKey="pass_rate" position="top" formatter={(v) => `${v}%`} style={LABEL_STYLE} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel">
          <div className="panel__header">
            <div><h2>이탈률 vs 고위험 비율</h2><span>낮을수록 좋음 · 이탈률 오름차순</span></div>
          </div>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byRisk} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="code_module" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={40} unit="%" />
                <Tooltip formatter={(v) => `${v}%`} />
                <Legend />
                <Bar dataKey="withdrawal_rate" name="이탈률" fill="#f87171" radius={[4, 4, 0, 0]} />
                <Bar dataKey="high_risk_rate" name="고위험 비율" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel">
          <div className="panel__header">
            <div><h2>종합 역량</h2><span>높을수록 좋음 · 내림차순</span></div>
          </div>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCompetency} margin={{ top: 24, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="code_module" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={40} domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="avg_competency_score" name="종합 역량" shape={<ProgramBar />}>
                  <LabelList dataKey="avg_competency_score" position="top" formatter={fmt1} style={LABEL_STYLE} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 행 2: 평가 / 참여 / 성실도 */}
        {[
          { title: '평가 점수', dataKey: 'avg_assessment_score', data: byAssessment },
          { title: '참여 점수', dataKey: 'avg_engagement_score', data: byEngagement },
          { title: '성실도',    dataKey: 'avg_diligence_score',  data: byDiligence },
        ].map(({ title, dataKey, data }) => (
          <section key={title} className="panel">
            <div className="panel__header">
              <div><h2>{title}</h2><span>높을수록 좋음 · 내림차순</span></div>
            </div>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 24, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="code_module" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={40} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey={dataKey} name={title} shape={<ProgramBar />}>
                    <LabelList dataKey={dataKey} position="top" formatter={fmt1} style={LABEL_STYLE} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        ))}

        {/* 산점도: 표본 크기 vs 합격률 */}
        <section className="panel panel--wide">
          <div className="panel__header">
            <div>
              <h2>표본 크기 vs 합격률</h2>
              <span>점 크기 = 평균 역량 점수 반영 · 표본이 작으면 합격률 해석에 주의</span>
            </div>
          </div>
          <div className="chart-box" style={{ height: 380 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 24, right: 48, bottom: 36, left: 16 }}>
                <CartesianGrid stroke="#e5e7eb" />
                <XAxis
                  dataKey="total_students"
                  name="수강생 수"
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
                >
                  <Label value="수강생 수 (표본 크기)" offset={-16} position="insideBottom" style={{ fill: '#526071', fontSize: 12 }} />
                </XAxis>
                <YAxis
                  dataKey="pass_rate"
                  name="합격률"
                  type="number"
                  unit="%"
                  domain={[30, 80]}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                >
                  <Label value="합격률 (%)" angle={-90} position="insideLeft" dy={40} style={{ fill: '#526071', fontSize: 12 }} />
                </YAxis>
                <ZAxis dataKey="avg_competency_score" range={[300, 1400]} name="평균 역량" />
                <Tooltip cursor={{ strokeDasharray: '4 4', stroke: '#94a3b8' }} content={<ScatterTooltipContent />} />
                <Scatter data={programs} shape={<ScatterDot />} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 종합 순위표 */}
        <section className="panel panel--wide">
          <div className="panel__header">
            <div>
              <h2>프로그램 종합 순위표</h2>
              <span>{sorted[0]?.code_module}이 현재 {SORT_OPTIONS.find(o => o.value === sortKey)?.label} 기준 1위</span>
            </div>
            <div className="programs-sort">
              <span>정렬 기준</span>
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={sortKey === opt.value ? 'segmented-control__item is-active' : 'segmented-control__item'}
                  style={{ border: '1px solid #d9e2ef', borderRadius: 8 }}
                  onClick={() => setSortKey(opt.value)}
                  type="button"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>순위</th>
                  <th>프로그램</th>
                  <th>수강생 수</th>
                  <th>합격률</th>
                  <th>우수 비율</th>
                  <th>이탈률</th>
                  <th>고위험 비율</th>
                  <th>평균 역량</th>
                  <th>평균 평가</th>
                  <th>평균 참여</th>
                  <th>평균 성실도</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p, idx) => (
                  <tr key={p.code_module}>
                    <td style={{ textAlign: 'center' }}><RankBadge rank={idx + 1} /></td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: MODULE_COLORS[p.code_module], display: 'inline-block' }} />
                        <strong>{p.code_module}</strong>
                      </span>
                    </td>
                    <td>{p.total_students.toLocaleString('ko-KR')}명</td>
                    <td>
                      <span style={{ color: p.pass_rate >= 55 ? '#0f766e' : p.pass_rate >= 45 ? '#d97706' : '#dc2626', fontWeight: 700 }}>
                        {fmt1(p.pass_rate)}%
                      </span>
                    </td>
                    <td>{fmt1(p.distinction_rate)}%</td>
                    <td>
                      <span style={{ color: p.withdrawal_rate >= 35 ? '#dc2626' : '#526071', fontWeight: p.withdrawal_rate >= 35 ? 700 : 400 }}>
                        {fmt1(p.withdrawal_rate)}%
                      </span>
                    </td>
                    <td>
                      <span style={{ color: p.high_risk_rate >= 50 ? '#dc2626' : '#526071', fontWeight: p.high_risk_rate >= 50 ? 700 : 400 }}>
                        {fmt1(p.high_risk_rate)}%
                      </span>
                    </td>
                    <td>{fmt1(p.avg_competency_score)}</td>
                    <td>{fmt1(p.avg_assessment_score)}</td>
                    <td>{fmt1(p.avg_engagement_score)}</td>
                    <td>{fmt1(p.avg_diligence_score)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </section>
    </main>
  );
}
