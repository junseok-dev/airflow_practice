import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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

const SORT_OPTIONS = [
  { label: '합격률', value: 'pass_rate' },
  { label: '평균 역량', value: 'avg_competency_score' },
  { label: '평균 평가', value: 'avg_assessment_score' },
  { label: '고위험 비율', value: 'high_risk_rate' },
  { label: '이탈률', value: 'withdrawal_rate' },
];

const LABEL_STYLE = { fontSize: 11, fontWeight: 700, fill: '#526071' };

function fmt1(value) {
  return Number(value ?? 0).toFixed(1);
}

function numberFormat(value) {
  return new Intl.NumberFormat('ko-KR').format(value ?? 0);
}

function ProgramBar({ x, y, width, height, payload }) {
  if (!height || height <= 0) return null;
  const fill = MODULE_COLORS[payload.code_module] ?? '#2563eb';
  return <rect x={x} y={y} width={width} height={Math.max(0, height)} fill={fill} rx={5} ry={5} />;
}

function ProgramChart({ title, subtitle, data, dataKey, unit = '' }) {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <h2>{title}</h2>
          <span>{subtitle}</span>
        </div>
      </div>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 24, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="code_module" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={44} unit={unit} domain={unit === '%' ? [0, 100] : [0, 100]} />
            <Tooltip formatter={(value) => `${fmt1(value)}${unit}`} />
            <Bar dataKey={dataKey} name={title} shape={<ProgramBar />}>
              <LabelList dataKey={dataKey} position="top" formatter={(value) => `${fmt1(value)}${unit}`} style={LABEL_STYLE} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function RankBadge({ rank }) {
  return <span style={{ color: rank <= 3 ? '#172033' : '#94a3b8', fontWeight: 800 }}>{rank}</span>;
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [sortKey, setSortKey] = useState('pass_rate');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPrograms()
      .then(setPrograms)
      .then(() => setStatus('success'))
      .catch((err) => {
        setError(err.message);
        setStatus('error');
      });
  }, []);

  useEffect(() => {
    document.title = '프로그램 비교 | 교육생 역량 분석';
  }, []);

  const byPassRate = useMemo(() => [...programs].sort((a, b) => b.pass_rate - a.pass_rate), [programs]);
  const byRisk = useMemo(() => [...programs].sort((a, b) => a.withdrawal_rate - b.withdrawal_rate), [programs]);
  const byCompetency = useMemo(() => [...programs].sort((a, b) => b.avg_competency_score - a.avg_competency_score), [programs]);
  const byAssessment = useMemo(() => [...programs].sort((a, b) => b.avg_assessment_score - a.avg_assessment_score), [programs]);
  const byEngagement = useMemo(() => [...programs].sort((a, b) => b.avg_engagement_score - a.avg_engagement_score), [programs]);
  const byDiligence = useMemo(() => [...programs].sort((a, b) => b.avg_diligence_score - a.avg_diligence_score), [programs]);
  const sorted = useMemo(() => [...programs].sort((a, b) => b[sortKey] - a[sortKey]), [programs, sortKey]);
  const selectedSortLabel = SORT_OPTIONS.find((option) => option.value === sortKey)?.label;

  if (status === 'loading') {
    return (
      <main className="app-shell">
        <AppHeader />
        <SkeletonChartGrid />
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="app-shell">
        <AppHeader />
        <div className="state-box state-box--error">{error}</div>
      </main>
    );
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

      <div className="program-legend">
        {Object.entries(MODULE_COLORS).map(([module, color]) => (
          <span key={module} className="program-legend__item">
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
            {module}
          </span>
        ))}
        <span className="program-legend__note">색상은 프로그램 모듈을 의미합니다.</span>
      </div>

      <section className="dashboard-grid dashboard-grid--programs">
        <ProgramChart title="합격률" subtitle="높을수록 좋음" data={byPassRate} dataKey="pass_rate" unit="%" />
        <ProgramChart title="이탈률" subtitle="낮을수록 좋음" data={byRisk} dataKey="withdrawal_rate" unit="%" />
        <ProgramChart title="종합 역량" subtitle="평균 역량 점수" data={byCompetency} dataKey="avg_competency_score" />
        <ProgramChart title="평가 점수" subtitle="평균 평가 점수" data={byAssessment} dataKey="avg_assessment_score" />
        <ProgramChart title="참여 점수" subtitle="평균 참여 점수" data={byEngagement} dataKey="avg_engagement_score" />
        <ProgramChart title="성실도" subtitle="평균 성실도 점수" data={byDiligence} dataKey="avg_diligence_score" />

        <section className="panel panel--wide">
          <div className="panel__header">
            <div>
              <h2>프로그램 종합 순위</h2>
              <span>{sorted[0]?.code_module}이 현재 {selectedSortLabel} 기준 1위</span>
            </div>
            <div className="programs-sort">
              <span>정렬 기준</span>
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={sortKey === option.value ? 'segmented-control__item is-active' : 'segmented-control__item'}
                  style={{ border: '1px solid #d9e2ef', borderRadius: 8 }}
                  onClick={() => setSortKey(option.value)}
                  type="button"
                >
                  {option.label}
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
                {sorted.map((program, idx) => (
                  <tr key={program.code_module}>
                    <td style={{ textAlign: 'center' }}><RankBadge rank={idx + 1} /></td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: MODULE_COLORS[program.code_module], display: 'inline-block' }} />
                        <strong>{program.code_module}</strong>
                      </span>
                    </td>
                    <td>{numberFormat(program.total_students)}명</td>
                    <td>{fmt1(program.pass_rate)}%</td>
                    <td>{fmt1(program.distinction_rate)}%</td>
                    <td>{fmt1(program.withdrawal_rate)}%</td>
                    <td>{fmt1(program.high_risk_rate)}%</td>
                    <td>{fmt1(program.avg_competency_score)}</td>
                    <td>{fmt1(program.avg_assessment_score)}</td>
                    <td>{fmt1(program.avg_engagement_score)}</td>
                    <td>{fmt1(program.avg_diligence_score)}</td>
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
