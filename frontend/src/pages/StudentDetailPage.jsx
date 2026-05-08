import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  fetchStudentCompetencies,
  fetchStudentDetail,
  fetchStudentWeeklyActivity,
} from '../api/dashboardApi.js';
import CompetencyRadarChart from '../components/charts/CompetencyRadarChart.jsx';
import WeeklyActivityChart from '../components/charts/WeeklyActivityChart.jsx';
import KpiCard from '../components/common/KpiCard.jsx';
import AppHeader from '../components/layout/AppHeader.jsx';
import { toCompetencyRadarData, toWeeklyChartData } from '../utils/chartData.js';
import { RISK_LABEL } from '../utils/riskLabel.js';

function numberFormat(value) {
  return new Intl.NumberFormat('ko-KR').format(value ?? 0);
}

function scoreFormat(value) {
  return Number(value ?? 0).toFixed(1);
}

function pickPrimaryRegistration(registrations = []) {
  return registrations[0] ?? null;
}

export default function StudentDetailPage() {
  const { studentId } = useParams();
  const [detail, setDetail] = useState(null);
  const [competencies, setCompetencies] = useState([]);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStudent() {
      try {
        setStatus('loading');
        const [detailData, competencyData, weeklyData] = await Promise.all([
          fetchStudentDetail(studentId),
          fetchStudentCompetencies(studentId),
          fetchStudentWeeklyActivity(studentId, { limit: 500 }),
        ]);

        setDetail(detailData);
        setCompetencies(competencyData.items);
        setWeeklyActivity(weeklyData.items);
        setStatus('success');
      } catch (err) {
        setError(err.message);
        setStatus('error');
      }
    }

    loadStudent();
  }, [studentId]);

  const primaryRegistration = pickPrimaryRegistration(detail?.registrations);
  const primaryCompetency = competencies[0] ?? primaryRegistration;
  const weeklyChartData = useMemo(
    () => toWeeklyChartData(weeklyActivity),
    [weeklyActivity],
  );
  const competencyRadarData = useMemo(
    () => toCompetencyRadarData(primaryCompetency),
    [primaryCompetency],
  );

  if (status === 'loading') {
    return (
      <main className="app-shell">
        <AppHeader />
        <div className="state-box">교육생 상세 데이터를 불러오는 중입니다.</div>
      </main>
    );
  }

  if (status === 'error' || !primaryRegistration) {
    return (
      <main className="app-shell">
        <AppHeader />
        <div className="state-box state-box--error">{error || '교육생 정보를 찾을 수 없습니다.'}</div>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <AppHeader />

      <div className="page-toolbar">
        <Link className="text-link" to="/">
          대시보드로 돌아가기
        </Link>
        <Link className="text-link" to="/students">
          교육생 목록
        </Link>
      </div>

      <section className="student-hero">
        <div>
          <p className="eyebrow">Student Profile</p>
          <h1>교육생 {studentId}</h1>
          <p>
            {primaryRegistration.code_module} / {primaryRegistration.code_presentation} ·{' '}
            {primaryRegistration.final_result}
          </p>
        </div>
        <span className={`badge badge--${primaryRegistration.risk_level}`}>
          {RISK_LABEL[primaryRegistration.risk_level] ?? primaryRegistration.risk_level}
        </span>
      </section>

      <section className="kpi-grid">
        <KpiCard
          label="종합 역량"
          value={scoreFormat(primaryRegistration.competency_score)}
          helper="평가, 참여, 성실도 가중합"
          tone="green"
        />
        <KpiCard
          label="평가 점수"
          value={scoreFormat(primaryRegistration.assessment_score)}
          helper={`${numberFormat(primaryRegistration.assessment_count)}개 평가`}
        />
        <KpiCard
          label="총 학습 클릭"
          value={numberFormat(primaryRegistration.total_clicks)}
          helper={`${numberFormat(primaryRegistration.active_days)}일 활동`}
          tone="blue"
        />
        <KpiCard
          label="제출률"
          value={`${scoreFormat(primaryRegistration.submission_rate)}%`}
          helper={`지연 제출률 ${scoreFormat(primaryRegistration.late_submission_rate)}%`}
          tone="red"
        />
      </section>

      <section className="dashboard-grid">
        <WeeklyActivityChart data={weeklyChartData} />
        <CompetencyRadarChart data={competencyRadarData} />

        <section className="panel panel--wide">
          <div className="panel__header">
            <div>
              <h2>수강 이력</h2>
              <span>{detail.registrations.length}건 표시</span>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>과정</th>
                  <th>결과</th>
                  <th>최종 학력</th>
                  <th>연령대</th>
                  <th>지역</th>
                  <th>평가</th>
                  <th>참여</th>
                  <th>성실도</th>
                  <th>종합</th>
                </tr>
              </thead>
              <tbody>
                {detail.registrations.map((registration) => (
                  <tr
                    key={`${registration.code_module}-${registration.code_presentation}-${registration.id_student}`}
                  >
                    <td>
                      {registration.code_module} / {registration.code_presentation}
                    </td>
                    <td>{registration.final_result}</td>
                    <td>{registration.highest_education}</td>
                    <td>{registration.age_band}</td>
                    <td>{registration.region}</td>
                    <td>{scoreFormat(registration.assessment_score)}</td>
                    <td>{scoreFormat(registration.engagement_score)}</td>
                    <td>{scoreFormat(registration.diligence_score)}</td>
                    <td>{scoreFormat(registration.competency_score)}</td>
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
