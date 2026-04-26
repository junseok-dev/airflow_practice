# 진행 기록

이 문서는 프로젝트를 처음부터 끝까지 따라갈 수 있도록 날짜별 작업 흐름을 기록합니다.

## 2026-04-26

### 1. 프로젝트 방향 설정

- React 프론트엔드 개발 인턴 공고를 기준으로 실습 방향을 정리했다.
- 최종 산출물을 **교육생 역량 대시보드**로 정했다.
- 단순 Airflow 실습이 아니라, React 화면 구현을 중심으로 FastAPI와 Airflow를 함께 연결하는 풀스택 실습으로 방향을 수정했다.

### 2. 기술 스택 결정

- Frontend: React, Vite, JavaScript, Recharts
- Backend: FastAPI, Pydantic
- Data Pipeline: Apache Airflow, Python, pandas
- Data: OULAD CSV
- Documentation: Markdown
- Design Practice: Figma, Wireframe, UI Spec

### 3. 데이터셋 선정

- 직접 만든 mock 데이터는 전처리 실습에 한계가 있다고 판단했다.
- 실제 학습 데이터 기반 분석을 위해 Open University Learning Analytics Dataset(OULAD)을 선택했다.
- OULAD는 교육생 정보, 평가 결과, 수강 등록, VLE 학습 활동 로그를 포함하고 있어 교육생 역량 대시보드에 적합하다고 판단했다.

### 4. 데이터 배치

- OULAD CSV 파일을 `data/raw/oulad/`로 이동했다.
- 원천 데이터는 용량이 커 Git에 올리지 않도록 `.gitignore`에 제외 규칙을 추가했다.

현재 원천 데이터 위치:

```text
data/raw/oulad/
  assessments.csv
  courses.csv
  OULAD.names
  studentAssessment.csv
  studentInfo.csv
  studentRegistration.csv
  studentVle.csv
  vle.csv
```

### 5. 프로젝트 폴더 구조 정리

React, FastAPI, Airflow, 데이터, 문서 폴더를 분리했다.

```text
frontend/
backend/
dags/
data/
scripts/
docs/
```

### 6. README 정리

- 프로젝트 목표를 교육생 역량 분석 대시보드로 정리했다.
- OULAD 데이터 출처, 크기, 파일 개수, 행 수를 기록했다.
- Figma 기반 UI 구현, 와이어프레임 구현, Markdown 문서화 실습을 포함했다.
- 폴더별 역할을 주석으로 설명했다.

### 7. 데이터 탐색 스크립트 작성

- `scripts/inspect_oulad.py`를 작성했다.
- CSV 파일별 크기, 행 수, 컬럼 수, 결측치, 조인 키 후보를 확인하도록 만들었다.
- `studentVle.csv`가 10,655,280행으로 크기 때문에 pandas 전체 로드 대신 Python CSV 스트리밍 방식으로 처리했다.
- OULAD의 `?` 값을 결측치로 처리하도록 반영했다.

### 8. 데이터 탐색 문서 생성

- `scripts/inspect_oulad.py` 실행 결과로 `docs/preprocessing.md`를 생성했다.
- 현재까지 완료된 것은 전처리가 아니라, 전처리 전 단계인 Raw Validation / 데이터 탐색이다.

주요 탐색 결과:

```text
CSV 파일 수: 7개
CSV 데이터 행 수 합계: 10,900,970행
CSV 파일 크기 합계: 442.89 MB
studentVle.csv 행 수: 10,655,280행
```

확인된 결측치:

```text
studentInfo.imd_band: 1,111개
studentRegistration.date_registration: 45개
studentRegistration.date_unregistration: 22,521개
studentAssessment.score: 173개
assessments.date: 11개
```

## 다음 작업

1. `scripts/transform_competency.py` 작성
2. `data/processed/student_profiles.csv` 생성
3. `data/processed/assessment_scores.csv` 생성
4. `data/processed/weekly_activity.csv` 생성
5. `data/mart/dashboard_summary.json` 생성
6. FastAPI에서 mart 데이터 반환
7. React 대시보드 화면 구현

### 9. 전처리 스크립트 작성 및 실행

- `scripts/transform_competency.py`를 작성했다.
- OULAD 원천 CSV를 조인/집계해 `data/processed/`와 `data/mart/` 산출물을 생성했다.
- `studentVle.csv`는 대용량 파일이므로 chunk 단위로 읽어 주차별 활동량을 계산했다.
- 전처리 결과는 `docs/transform.md`에 기록했다.

생성된 processed 데이터:

```text
data/processed/student_profiles.csv
data/processed/assessment_scores.csv
data/processed/weekly_activity.csv
data/processed/student_scores.csv
```

생성된 mart 데이터:

```text
data/mart/dashboard_summary.json
data/mart/student_scores.json
data/mart/weekly_activity.json
data/mart/competency_scores.json
data/mart/risk_students.json
```

주요 결과:

```text
고유 교육생 수: 28,785명
수강 기록 수: 32,593건
평균 평가 점수: 57.65
평균 학습 참여 점수: 24.34
평균 학습 성실도 점수: 72.07
평균 종합 역량 점수: 48.87
위험 교육생 수: 25,687명
고위험 교육생 수: 14,607명
```

주의:

- 현재 위험도 기준은 첫 번째 임시 기준이다.
- React 대시보드에서 필터와 차트를 구현한 뒤 기준을 조정할 수 있다.

### 10. 전처리 학습 노트 작성

- `docs/study-notes.md`를 작성했다.
- 단순 작업 기록이 아니라, 공부할 때 다시 볼 수 있는 개념 중심 문서로 정리했다.
- raw/processed/mart 차이, 조인, 결측치, 집계, chunk 처리, 정규화, 지표 설계, 위험도 분류, 실무 검증 포인트를 정리했다.

### 11. FastAPI 백엔드 기본 API 구현

- `backend/app/main.py`를 생성해 FastAPI 앱 시작점을 만들었다.
- `backend/app/services/mart_loader.py`에서 `data/mart/` JSON 파일을 읽도록 구현했다.
- 큰 mart JSON을 매 요청마다 다시 읽지 않도록 `lru_cache`로 캐시했다.
- React 개발 서버 연동을 위해 `localhost:5173` CORS를 허용했다.
- `docs/api-spec.md`에 API 명세와 실행 방법을 기록했다.

구현한 엔드포인트:

```text
GET /api/health
GET /api/dashboard/summary
GET /api/students
GET /api/students/{student_id}
GET /api/students/{student_id}/competencies
GET /api/weekly-activity
GET /api/risk-students
```

검증:

```text
/api/health -> {"status": "ok"}
/api/dashboard/summary -> total_students = 28,785
/api/students?limit=2 -> total = 32,593
/api/risk-students?limit=2 -> items 2건 반환
```

### 12. React 프론트엔드 기본 대시보드 구현

- `frontend/`에 Vite + React 프로젝트 구조를 만들었다.
- `Recharts`를 사용해 최종 결과 분포와 위험도 분포 막대 차트를 구현했다.
- FastAPI API를 호출하는 `frontend/src/api/dashboardApi.js`를 작성했다.
- KPI 카드, 차트 패널, 위험 교육생 테이블을 컴포넌트로 분리했다.
- Vite 프록시를 설정해 React 개발 서버에서 `/api` 요청이 FastAPI로 전달되도록 했다.
- `npm.cmd install`로 의존성을 설치하고 `npm.cmd run build`로 빌드 검증을 완료했다.

구현한 화면 구성:

```text
KPI 카드
- 고유 교육생
- 평균 종합 역량
- 위험 교육생
- 총 학습 클릭

차트
- 최종 결과 분포
- 위험도 분포

테이블
- 고위험 교육생 목록
```

실행 확인:

```text
FastAPI: http://127.0.0.1:8000/api/health -> {"status":"ok"}
React: http://127.0.0.1:5173 -> 200
Vite proxy: http://127.0.0.1:5173/api/dashboard/summary -> 200
```

### 13. Airflow DAG 작성

- `dags/trainee_competency_etl.py`를 작성했다.
- 수동으로 실행하던 데이터 탐색/전처리 스크립트를 Airflow 태스크 흐름으로 묶었다.
- 현재 로컬 Python 환경에는 Airflow가 설치되어 있지 않아 실제 DAG 실행은 아직 하지 않았다.
- 대신 `python -m py_compile dags/trainee_competency_etl.py`로 Python 문법 검사를 완료했다.
- Airflow 자동화 구조와 실행 전 준비 사항은 `docs/airflow.md`에 기록했다.

DAG 흐름:

```text
check_raw_files
↓
inspect_oulad_data
↓
transform_competency_data
↓
validate_mart_outputs
```

현재 상태:

```text
DAG 파일 작성 완료
문법 검사 완료
Airflow 런타임 실행은 미완료
```

### 14. WSL 기반 Airflow 실행 환경 정리

- Windows에서 WSL Ubuntu를 설치하고 프로젝트 폴더를 `/mnt/c/Workspaces/airflow_practice`로 열었다.
- WSL 홈 경로에 Python 가상환경 `~/.venvs/airflow_practice_env`를 생성했다.
- Airflow standalone 로그인을 완료했다.
- Airflow 3.x 기준으로 DAG import 경로를 수정했다.
- 반복 실행을 줄이기 위해 `scripts/start_airflow.sh`를 추가했다.
- 새 터미널/새 에이전트가 환경을 복구할 수 있도록 `AGENTS.md`와 `에이전트.md`를 작성했다.
- WSL에 Node.js, npm, Codex CLI를 설치하고 ChatGPT 계정 로그인을 완료했다.

다음 작업:

```text
1. bash scripts/start_airflow.sh 실행
2. Airflow UI에서 trainee_competency_etl DAG 확인
3. Trigger DAG로 수동 실행
4. 태스크 성공/실패 로그 확인
5. 성공하면 Airflow 실행 완료 기록 추가
```

### 15. Airflow DAG 전체 실행 성공 (2026-04-26)

- `bash scripts/start_airflow.sh`로 Airflow standalone을 실행했다.
- Airflow UI(`http://localhost:8080`)에서 `trainee_competency_etl` DAG를 확인했다.
- `Trigger DAG`로 수동 실행했다.
- 네 태스크가 모두 **성공(초록색)** 으로 완료됐다.

태스크별 결과:

| 태스크 | 오퍼레이터 | 상태 | 시작시각 |
|---|---|---|---|
| check_raw_files | PythonOperator | ✅ 성공 | 14:59:40 |
| inspect_oulad_data | BashOperator | ✅ 성공 | 14:59:41 |
| transform_competency_data | BashOperator | ✅ 성공 | 15:00:55 |
| validate_mart_outputs | PythonOperator | ✅ 성공 | 15:01:30 |

- DAG 전체 실행 시간: 약 1분 51초
- DAG 버전: v2

이로써 Airflow ETL 파이프라인이 정상 동작함을 확인했다.

---

## 다음 작업 (Next Steps)

### Phase 4 — 대시보드 완성 및 인터랙션 구현

1. **FastAPI + React 연동 실제 확인**
   - FastAPI 서버(`uvicorn backend.app.main:app --reload`)와 React dev 서버(`npm run dev`)를 동시에 실행한다.
   - 브라우저에서 `http://127.0.0.1:5173`을 열어 KPI 카드와 차트에 실제 데이터가 표시되는지 확인한다.
   - 연동이 안 되면 Vite proxy 설정과 CORS 설정을 점검한다.

2. **React UI 개선**
   - KPI 카드, 차트, 테이블의 디자인을 개선한다 (색상, 폰트, 레이아웃).
   - Recharts로 추가 차트를 구현한다 (예: 주차별 활동 라인 차트, 역량 레이더 차트).
   - 개별 교육생 상세 페이지를 구현한다 (`/students/:id`).
   - 위험 교육생 필터(전체 / 위험 / 고위험)를 구현한다.

3. **Airflow 스케줄링 설정**
   - DAG의 `schedule` 파라미터에 cron 표현식을 추가해 자동 주기 실행을 설정한다.
   - 예: `schedule="0 2 * * *"` (매일 새벽 2시)

4. **문서 마무리**
   - `README.md`에 실행 방법과 스크린샷을 추가한다.
   - Figma 와이어프레임과 최종 화면을 비교하는 설계 문서를 작성한다.
   - `docs/decisions.md`에 주요 기술 결정 이유를 추가한다.

5. **Git 커밋 및 GitHub 푸시**
   - 현재 변경 사항을 스테이징하고 의미 단위로 커밋한다.
   - `origin/main`에 푸시해 원격 저장소와 동기화한다.
