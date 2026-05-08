import { Navigate, Route, Routes } from 'react-router-dom';

import DashboardPage from './pages/DashboardPage.jsx';
import StudentDetailPage from './pages/StudentDetailPage.jsx';
import StudentsPage from './pages/StudentsPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<DashboardPage />} path="/" />
      <Route element={<StudentsPage />} path="/students" />
      <Route element={<StudentDetailPage />} path="/students/:studentId" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}
