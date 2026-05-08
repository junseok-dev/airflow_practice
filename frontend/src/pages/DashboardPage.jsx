import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SkeletonChartGrid, SkeletonKpiGrid } from '../components/common/Skeleton.jsx';

import {
  fetchDashboardSummary,
  fetchRiskStudents,
  fetchWeeklyActivity,
} from '../api/dashboardApi.js';
import CompetencyRadarChart from '../components/charts/CompetencyRadarChart.jsx';
import DistributionChart from '../components/charts/DistributionChart.jsx';
import WeeklyActivityChart from '../components/charts/WeeklyActivityChart.jsx';
import KpiCard from '../components/common/KpiCard.jsx';
import RiskFilter from '../components/dashboard/RiskFilter.jsx';
import RiskStudentTable from '../components/dashboard/RiskStudentTable.jsx';
import AppHeader from '../components/layout/AppHeader.jsx';
import { toCompetencyRadarData, toWeeklyChartData } from '../utils/chartData.js';

function numberFormat(value) {
  return new Intl.NumberFormat('ko-KR').format(value ?? 0);
}

function scoreFormat(value) {
  return Number(value ?? 0).toFixed(1);
}

function toChartData(source = {}) {
  return Object.entries(source).map(([name, value]) => ({ name, value }));
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [riskStudents, setRiskStudents] = useState([]);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [riskFilter, setRiskFilter] = useState('high');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        setStatus('loading');
        const [summaryData, riskData, weeklyData] = await Promise.all([
          fetchDashboardSummary(),
          fetchRiskStudents({ limit: 12, riskLevel: 'high' }),
          fetchWeeklyActivity({ limit: 5000 }),
        ]);
        setSummary(summaryData);
        setRiskStudents(riskData.items);
        setWeeklyActivity(weeklyData.items);
        setStatus('success');
      } catch (err) {
        setError(err.message);
        setStatus('error');
      }
    }

    loadDashboard();
  }, []);

  useEffect(() => {
    if (status !== 'success') {
      return;
    }

    async function loadRiskStudents() {
      try {
        const riskData = await fetchRiskStudents({ limit: 12, riskLevel: riskFilter });
        setRiskStudents(riskData.items);
      } catch (err) {
        setError(err.message);
        setStatus('error');
      }
    }

    loadRiskStudents();
  }, [riskFilter, status]);

  const resultChartData = useMemo(
    () => toChartData(summary?.final_result_counts),
    [summary],
  );
  const riskChartData = useMemo(
    () => toChartData(summary?.risk_level_counts),
    [summary],
  );
  const weeklyChartData = useMemo(
    () => toWeeklyChartData(weeklyActivity),
    [weeklyActivity],
  );
  const competencyRadarData = useMemo(
    () => toCompetencyRadarData(summary),
    [summary],
  );

  useEffect(() => { document.title = '대시보드 | 교육생 역량 분석'; }, []);

  if (status === 'loading') {
    return (
      <main className="app-shell">
        <AppHeader />
        <SkeletonKpiGrid />
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
        <Link className="text-link" to="/students">
          전체 교육생 보기
        </Link>
      </div>

      <section className="kpi-grid">
        <KpiCard
          label="고유 교육생"
          value={`${numberFormat(summary.total_students)}명`}
          helper={`${numberFormat(summary.total_registrations)}건의 수강 기록`}
        />
        <KpiCard
          label="평균 종합 역량"
          value={scoreFormat(summary.average_competency_score)}
          helper="평가, 참여, 성실도 가중합"
          tone="green"
        />
        <KpiCard
          label="위험 교육생"
          value={`${numberFormat(summary.risk_student_count)}명`}
          helper={`고위험 ${numberFormat(summary.high_risk_student_count)}명`}
          tone="red"
        />
        <KpiCard
          label="총 학습 클릭"
          value={numberFormat(summary.total_clicks)}
          helper={`평균 참여 점수 ${scoreFormat(summary.average_engagement_score)}`}
          tone="blue"
        />
      </section>

      <section className="dashboard-grid">
        <DistributionChart title="최종 결과 분포" data={resultChartData} color="#2563eb" />
        <DistributionChart title="위험도 분포" data={riskChartData} color="#dc2626" />
        <WeeklyActivityChart data={weeklyChartData} />
        <CompetencyRadarChart data={competencyRadarData} />
        <RiskStudentTable
          actions={<RiskFilter value={riskFilter} onChange={setRiskFilter} />}
          students={riskStudents}
        />
      </section>
    </main>
  );
}
