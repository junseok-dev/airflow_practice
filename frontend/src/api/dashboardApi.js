const API_BASE_URL = '/api';

async function request(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export function fetchDashboardSummary() {
  return request('/dashboard/summary');
}

export function fetchStudents({
  limit = 20,
  offset = 0,
  riskLevel = '',
  codeModule = '',
} = {}) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  if (riskLevel) {
    params.set('risk_level', riskLevel);
  }
  if (codeModule) {
    params.set('code_module', codeModule);
  }

  return request(`/students?${params.toString()}`);
}

export function fetchRiskStudents({ limit = 12, offset = 0, riskLevel = 'high' } = {}) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  if (riskLevel) {
    params.set('risk_level', riskLevel);
  }

  return request(`/risk-students?${params.toString()}`);
}

export function fetchWeeklyActivity({ limit = 5000, offset = 0 } = {}) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  return request(`/weekly-activity?${params.toString()}`);
}

export function fetchStudentDetail(studentId) {
  return request(`/students/${studentId}`);
}

export function fetchStudentCompetencies(studentId) {
  return request(`/students/${studentId}/competencies`);
}

export function fetchStudentWeeklyActivity(studentId, { limit = 500, offset = 0 } = {}) {
  const params = new URLSearchParams({
    student_id: String(studentId),
    limit: String(limit),
    offset: String(offset),
  });

  return request(`/weekly-activity?${params.toString()}`);
}
