# API 명세

FastAPI는 `data/mart/`에 생성된 대시보드용 JSON 데이터를 읽어 React 프론트엔드에 제공합니다.

## 실행 방법

```bash
uvicorn app.main:app --reload --app-dir backend
```

실행 후 확인:

```text
http://127.0.0.1:8000/docs
```

## Endpoints

### GET /api/health

서버 상태를 확인합니다.

응답 예시:

```json
{
  "status": "ok"
}
```

### GET /api/dashboard/summary

대시보드 KPI 카드에 사용할 요약 데이터를 반환합니다.

사용 파일:

```text
data/mart/dashboard_summary.json
```

주요 응답 필드:

- `total_students`
- `total_registrations`
- `average_assessment_score`
- `average_engagement_score`
- `average_diligence_score`
- `average_competency_score`
- `risk_student_count`
- `high_risk_student_count`
- `final_result_counts`
- `risk_level_counts`

### GET /api/students

교육생 목록을 페이지네이션으로 반환합니다.

Query Parameters:

| 이름 | 설명 | 기본값 |
| --- | --- | ---: |
| `limit` | 한 번에 가져올 개수 | 50 |
| `offset` | 시작 위치 | 0 |
| `risk_level` | `low`, `medium`, `high` 필터 | 없음 |
| `code_module` | 과정 모듈 필터 | 없음 |

예시:

```text
GET /api/students?limit=50&offset=0&risk_level=high
```

### GET /api/students/{student_id}

특정 교육생의 수강 기록과 종합 지표를 반환합니다.

OULAD에서는 같은 교육생이 여러 과정에 등록할 수 있으므로, 응답은 `registrations` 배열입니다.

### GET /api/students/{student_id}/competencies

특정 교육생의 역량 점수 데이터를 반환합니다.

사용 파일:

```text
data/mart/competency_scores.json
```

### GET /api/weekly-activity

주차별 학습 활동량을 반환합니다.

Query Parameters:

| 이름 | 설명 | 기본값 |
| --- | --- | ---: |
| `student_id` | 교육생 ID 필터 | 없음 |
| `code_module` | 과정 모듈 필터 | 없음 |
| `limit` | 한 번에 가져올 개수 | 500 |
| `offset` | 시작 위치 | 0 |

### GET /api/risk-students

위험 교육생 목록을 반환합니다.

Query Parameters:

| 이름 | 설명 | 기본값 |
| --- | --- | ---: |
| `limit` | 한 번에 가져올 개수 | 50 |
| `offset` | 시작 위치 | 0 |
| `risk_level` | `medium`, `high` 필터 | 없음 |

## 구현 메모

- `backend/app/services/mart_loader.py`에서 mart JSON 파일을 읽습니다.
- 큰 JSON을 매 요청마다 다시 읽지 않도록 `lru_cache`로 캐시합니다.
- React 개발 서버를 고려해 `http://localhost:5173` CORS를 허용합니다.
- `weekly_activity.json`은 크기가 크므로 프론트엔드에서는 반드시 필터와 페이지네이션을 사용해야 합니다.
