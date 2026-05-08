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

function SortIcon({ field, sortBy, sortOrder }) {
  if (sortBy !== field) return <span className="sort-icon">↕</span>;
  return <span className="sort-icon sort-icon--active">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
}

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
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
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
          sortBy,
          sortOrder,
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
  }, [offset, riskLevel, codeModule, sortBy, sortOrder]);

  useEffect(() => { document.title = '교육생 목록 | 교육생 역량 분석'; }, []);

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

  function handleSort(field) {
    setOffset(0);
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
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
            <div className={`table-wrap${status === 'loading' && students.length > 0 ? ' table-wrap--refreshing' : ''}`}>
              <table>
                <thead>
                  <tr>
                    <th>교육생 ID</th>
                    <th>과정</th>
                    <th>최종 결과</th>
                    <th className="th-sortable" onClick={() => handleSort('assessment_score')}>
                      평가 <SortIcon field="assessment_score" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th className="th-sortable" onClick={() => handleSort('engagement_score')}>
                      참여 <SortIcon field="engagement_score" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th className="th-sortable" onClick={() => handleSort('diligence_score')}>
                      성실도 <SortIcon field="diligence_score" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th className="th-sortable" onClick={() => handleSort('competency_score')}>
                      종합 <SortIcon field="competency_score" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th>위험도</th>
                    <th className="th-sortable" onClick={() => handleSort('active_days')}>
                      활동일 <SortIcon field="active_days" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th className="th-sortable" onClick={() => handleSort('total_clicks')}>
                      클릭 <SortIcon field="total_clicks" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={`${student.code_module}-${student.code_presentation}-${student.id_student}`}>
                      <td>
                        <Link className="table-link" to={`/students/${student.id_student}`}>
                          #{student.id_student}
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

            {status === 'success' && students.length === 0 && (
              <div className="empty-state">
                조건에 맞는 교육생이 없습니다.
                <p>필터를 변경해보세요.</p>
              </div>
            )}

            <div className="pagination-bar">
              <span>
                {numberFormat(pageNumber)} / {numberFormat(totalPages)} 페이지
                &nbsp;·&nbsp;
                {resultLabel}
              </span>
              <div className="pagination-controls">
                <button
                  className="pagination-btn pagination-btn--edge"
                  disabled={!canGoPrevious}
                  onClick={() => setOffset(0)}
                  title="맨 처음"
                  type="button"
                >«</button>
                {[100, 50, 10].map((n) => (
                  <button
                    key={`-${n}`}
                    className="pagination-btn"
                    disabled={!canGoPrevious}
                    onClick={() => setOffset(Math.max(0, offset - n * PAGE_SIZE))}
                    type="button"
                  >-{n}</button>
                ))}
                <button
                  className="pagination-btn"
                  disabled={!canGoPrevious}
                  onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                  type="button"
                >이전</button>
                <button
                  className="pagination-btn"
                  disabled={!canGoNext}
                  onClick={() => setOffset(offset + PAGE_SIZE)}
                  type="button"
                >다음</button>
                {[10, 50, 100].map((n) => (
                  <button
                    key={`+${n}`}
                    className="pagination-btn"
                    disabled={!canGoNext}
                    onClick={() => setOffset(Math.min((totalPages - 1) * PAGE_SIZE, offset + n * PAGE_SIZE))}
                    type="button"
                  >+{n}</button>
                ))}
                <button
                  className="pagination-btn pagination-btn--edge"
                  disabled={!canGoNext}
                  onClick={() => setOffset((totalPages - 1) * PAGE_SIZE)}
                  title="맨 끝"
                  type="button"
                >»</button>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
