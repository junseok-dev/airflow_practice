# API 명세

FastAPI는 `data/mart/`에 생성된 대시보드용 JSON 데이터를 읽어 React 프론트엔드에 제공합니다.

mart 데이터는 TTL 캐시(10분)로 관리됩니다. Airflow ETL이 파일을 갱신하면 최대 10분 이내에 자동으로 최신 데이터가 반영됩니다.

## 실행 방법

```bash
PYTHONPATH=backend python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8001 --reload
```

실행 후 확인:

```text
http://127.0.0.1:8001/docs
```

## Endpoints

### GET /api/health

서버 상태를 확인합니다.

응답 예시:

```json
{ "status": "ok" }
```

---

### GET /api/dashboard/summary

대시보드 KPI 카드에 사용할 요약 데이터를 반환합니다.

사용 파일: `data/mart/dashboard_summary.json`

주요 응답 필드:

| 필드 | 설명 |
| --- | --- |
| `total_students` | 고유 교육생 수 |
| `total_registrations` | 전체 수강 건수 |
| `average_competency_score` | 평균 종합 역량 점수 |
| `average_assessment_score` | 평균 평가 점수 |
| `average_engagement_score` | 평균 참여 점수 |
| `average_diligence_score` | 평균 성실도 점수 |
| `risk_student_count` | 위험 교육생 수 |
| `high_risk_student_count` | 고위험 교육생 수 |
| `total_clicks` | 전체 학습 클릭 수 |
| `final_result_counts` | 최종 결과별 건수 맵 |
| `risk_level_counts` | 위험도별 건수 맵 |

---

### GET /api/students

교육생 목록을 페이지네이션으로 반환합니다.

사용 파일: `data/mart/student_scores.json`

Query Parameters:

| 이름 | 설명 | 기본값 |
| --- | --- | --- |
| `limit` | 한 번에 가져올 개수 (max 500) | 50 |
| `offset` | 시작 위치 | 0 |
| `risk_level` | `low` \| `medium` \| `high` 필터 | 없음 |
| `code_module` | 과정 모듈 필터 (AAA~GGG) | 없음 |
| `sort_by` | 정렬 기준 컬럼 | 없음 |
| `sort_order` | `asc` \| `desc` | `desc` |

`sort_by` 허용 값: `assessment_score`, `engagement_score`, `diligence_score`, `competency_score`, `total_clicks`, `active_days`

예시:

```text
GET /api/students?limit=20&offset=0&risk_level=high&sort_by=competency_score&sort_order=asc
```

응답:

```json
{
  "total": 14607,
  "limit": 20,
  "offset": 0,
  "items": [ ... ]
}
```

---

### GET /api/students/{student_id}

특정 교육생의 수강 이력과 지표를 반환합니다.

OULAD에서는 같은 교육생이 여러 과정에 등록할 수 있으므로 `registrations` 배열로 반환됩니다.

응답:

```json
{
  "student_id": 30268,
  "registrations": [
    {
      "code_module": "AAA",
      "code_presentation": "2013J",
      "final_result": "Withdrawn",
      "competency_score": 2.15,
      ...
    }
  ]
}
```

---

### GET /api/students/{student_id}/competencies

특정 교육생의 역량 점수 데이터를 반환합니다.

사용 파일: `data/mart/competency_scores.json`

---

### GET /api/weekly-activity

주차별 학습 활동량을 반환합니다.

사용 파일: `data/mart/weekly_activity.json`

Query Parameters:

| 이름 | 설명 | 기본값 |
| --- | --- | --- |
| `student_id` | 교육생 ID 필터 | 없음 |
| `code_module` | 과정 모듈 필터 | 없음 |
| `limit` | 한 번에 가져올 개수 (max 5000) | 500 |
| `offset` | 시작 위치 | 0 |

---

### GET /api/risk-students

위험 교육생 목록을 반환합니다. 활동 기록이 있는 학생을 우선으로, 역량 점수 오름차순 정렬됩니다.

사용 파일: `data/mart/risk_students.json`

Query Parameters:

| 이름 | 설명 | 기본값 |
| --- | --- | --- |
| `limit` | 한 번에 가져올 개수 (max 500) | 50 |
| `offset` | 시작 위치 | 0 |
| `risk_level` | `medium` \| `high` 필터 | 없음 |

---

### GET /api/programs

프로그램(과정 모듈)별 성과 지표를 집계해 반환합니다.

사용 파일: `data/mart/student_scores.json`

응답 (배열):

| 필드 | 설명 |
| --- | --- |
| `code_module` | 과정 코드 (AAA~GGG) |
| `total_students` | 수강생 수 (등록 건수) |
| `pass_rate` | 합격률 (Pass + Distinction) |
| `distinction_rate` | 우수 비율 |
| `withdrawal_rate` | 이탈률 |
| `high_risk_rate` | 고위험 비율 |
| `avg_competency_score` | 평균 종합 역량 |
| `avg_assessment_score` | 평균 평가 점수 |
| `avg_engagement_score` | 평균 참여 점수 |
| `avg_diligence_score` | 평균 성실도 점수 |
