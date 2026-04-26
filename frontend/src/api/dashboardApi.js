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
