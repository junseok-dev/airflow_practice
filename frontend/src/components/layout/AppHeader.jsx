import { NavLink } from 'react-router-dom';

export default function AppHeader() {
  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">OULAD Learning Analytics</p>
        <h1>교육생 역량 분석 대시보드</h1>
      </div>
      <div className="header-right">
        <nav className="app-nav">
          <NavLink className={({ isActive }) => isActive ? 'app-nav__link is-active' : 'app-nav__link'} to="/" end>
            대시보드
          </NavLink>
          <NavLink className={({ isActive }) => isActive ? 'app-nav__link is-active' : 'app-nav__link'} to="/students">
            교육생 목록
          </NavLink>
          <NavLink className={({ isActive }) => isActive ? 'app-nav__link is-active' : 'app-nav__link'} to="/programs">
            프로그램 비교
          </NavLink>
        </nav>
        <div className="header-meta">
          <span>React</span>
          <span>FastAPI</span>
          <span>Airflow</span>
        </div>
      </div>
    </header>
  );
}
