import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { fetchStudents } from '../api/dashboardApi.js';
import AppHeader from '../components/layout/AppHeader.jsx';
import { RISK_LABEL } from '../utils/riskLabel.js';

const PAGE_SIZE = 20;
const MODULE_OPTIONS = ['', 'AAA', 'BBB', 'CCC', 'DDD', 'EEE', 'FFF', 'GGG'];
const RISK_OPTIONS = [
  { label: '전체', value: '' },
  { label: '고위험', value: 'high' },
  { label: '중위험', value: 'medium' },
  { label: '저위험', value: 'low' },
];

function formatScore(value) {
  if (value === null || value === undefined) {
    return '-';
  }

  return Number(value).toFixed(1);
}

function numberFormat(value) {
  return new Intl.NumberFormat('ko-KR').format(value ?? 0);
}

export default function StudentsPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [riskLevel, setRiskLevel] = useState('');
  const [codeModule, setCodeModule] = useState('');
  const [studentIdQuery, setStudentIdQuery] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStudents() {
      try {
        setStatus('loading');
        const data = await fetchStudents({
          limit: PAGE_SIZE,
          offset,
          riskLevel,
          codeModule,
        });
        setStudents(data.items);
        setTotal(data.total);
        setStatus('success');
      } catch (err) {
        setError(err.message);
        setStatus('error');
      }
    }

    loadStudents();
  }, [offset, riskLevel, codeModule]);

  const pageNumber = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canGoPrevious = offset > 0;
  const canGoNext = offset + PAGE_SIZE < total;
  const resultLabel = useMemo(
    () => `${numberFormat(total)}건 중 ${numberFormat(offset + 1)}-${numberFormat(Math.min(offset + PAGE_SIZE, total))}`,
    [offset, total],
  );

  function resetAndSetRisk(nextRiskLevel) {
    setOffset(0);
    setRiskLevel(nextRiskLevel);
  }

  function resetAndSetModule(nextCodeModule) {
    setOffset(0);
    setCodeModule(nextCodeModule);
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    const normalizedQuery = studentIdQuery.trim();

    if (normalizedQuery) {
      navigate(`/students/${normalizedQuery}`);
    }
  }

  return (
    <main className="app-shell">
      <AppHeader />

      <div className="page-toolbar">
        <Link className="text-link" to="/">
          대시보드로 돌아가기
        </Link>
      </div>

      <section className="panel panel--wide">
        <div className="panel__header">
          <div>
            <h2>교육생 목록</h2>
            <span>{status === 'success' ? resultLabel : '데이터 조회 중'}</span>
          </div>
        </div>

        <div className="filter-bar">
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <input
              inputMode="numeric"
              onChange={(event) => setStudentIdQuery(event.target.value)}
              placeholder="교육생 ID"
              type="search"
              value={studentIdQuery}
            />
            <button type="submit">검색</button>
          </form>

          <label>
            위험도
            <select onChange={(event) => resetAndSetRisk(event.target.value)} value={riskLevel}>
              {RISK_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            과정
            <select onChange={(event) => resetAndSetModule(event.target.value)} value={codeModule}>
              {MODULE_OPTIONS.map((module) => (
                <option key={module || 'all'} value={module}>
                  {module || '전체'}
                </option>
              ))}
            </select>
          </label>
        </div>

        {status === 'error' && <div className="state-box state-box--error">{error}</div>}

        {status !== 'error' && (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>교육생 ID</th>
                    <th>과정</th>
                    <th>최종 결과</th>
                    <th>평가</th>
                    <th>참여</th>
                    <th>성실도</th>
                    <th>종합</th>
                    <th>위험도</th>
                    <th>활동일</th>
                    <th>클릭</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={`${student.code_module}-${student.code_presentation}-${student.id_student}`}>
                      <td>
                        <Link className="table-link" to={`/students/${student.id_student}`}>
                          {student.id_student}
                        </Link>
                      </td>
                      <td>
                        {student.code_module} / {student.code_presentation}
                      </td>
                      <td>{student.final_result}</td>
                      <td>{formatScore(student.assessment_score)}</td>
                      <td>{formatScore(student.engagement_score)}</td>
                      <td>{formatScore(student.diligence_score)}</td>
                      <td>{formatScore(student.competency_score)}</td>
                      <td>
                        <span className={`badge badge--${student.risk_level}`}>{RISK_LABEL[student.risk_level] ?? student.risk_level}</span>
                      </td>
                      <td>{numberFormat(student.active_days)}</td>
                      <td>{numberFormat(student.total_clicks)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination-bar">
              <span>
                {numberFormat(pageNumber)} / {numberFormat(totalPages)} 페이지
              </span>
              <div>
                <button
                  disabled={!canGoPrevious}
                  onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                  type="button"
                >
                  이전
                </button>
                <button
                  disabled={!canGoNext}
                  onClick={() => setOffset(offset + PAGE_SIZE)}
                  type="button"
                >
                  다음
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
