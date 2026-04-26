# 교육생 역량 분석 대시보드

React 프론트엔드 인턴 준비를 위한 **교육생 역량 대시보드** 풀스택 실습 프로젝트입니다.

Open University Learning Analytics Dataset(OULAD)의 실제 학습 데이터를 전처리해 교육생 역량 지표를 만들고, FastAPI REST API와 React 대시보드로 시각화합니다. Airflow는 원천 CSV를 정제하고 대시보드용 mart 데이터를 생성하는 파이프라인으로 사용합니다.

## 프로젝트 개요

교육생의 학습 데이터를 기반으로 역량 지표를 생성하고, 이를 차트와 대시보드 형태로 시각화하는 실무형 프로젝트입니다.

단순 UI 구현이 아니라 **데이터 수집 -> 전처리 -> 저장 -> API -> 시각화** 전체 흐름을 경험하는 것을 목표로 합니다.

## 실습 배경

이 프로젝트는 React 프론트엔드 개발 인턴 업무를 미리 연습하기 위해 시작했습니다.

실습 목표는 다음 채용 업무와 직접 연결됩니다.

- 교육생의 역량 지표를 차트와 대시보드 형태로 구현
- Figma 디자인 가이드를 바탕으로 PC 중심의 반응형 React 화면 구현
- 재사용 가능한 UI 컴포넌트 분리 및 디자인 시스템 정리
- 백엔드 REST API를 연동하여 동적 데이터 화면 반영
- 목업/와이어프레임을 실제 서비스 화면으로 구현
- Markdown으로 진행 상황, 이슈, 결과물 문서화

추가로 FastAPI와 Airflow를 함께 실습해, 프론트엔드 화면이 어떤 데이터 흐름 위에서 동작하는지 이해하는 것을 목표로 합니다.

## 프로젝트 목표

- OULAD 실제 교육 데이터를 기반으로 의미 있는 역량 지표 설계
- Pandas 전처리, Airflow 자동화, FastAPI API, React 시각화 흐름 구현
- Recharts 기반 데이터 시각화
- REST API 연동을 통한 동적 데이터 처리
- 재사용 가능한 UI 컴포넌트 설계
- Figma 또는 Markdown 기반 UI Spec 작성
- Markdown 문서화 습관 만들기

## 기술 스택

### Frontend

- React
- Vite
- JavaScript
- Recharts
- HTML/CSS

### Backend & Data

- Python
- Pandas
- FastAPI
- Pydantic
- Apache Airflow
- PostgreSQL

## 실행 방법

### 1. FastAPI 실행

```bash
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
```

확인:

```text
http://127.0.0.1:8000/docs
http://127.0.0.1:8000/api/health
```

### 2. React 실행

```bash
cd frontend
npm.cmd install
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```

확인:

```text
http://127.0.0.1:5173
```

### Design & Documentation

- Figma
- Wireframe
- Markdown
- Git / GitHub
- DBeaver

## 전체 아키텍처

```text
OULAD CSV
-> Airflow
-> raw 데이터 검증
-> processed 데이터 생성
-> mart 데이터 생성
-> FastAPI
-> React Dashboard
```

```text
Airflow
-> 원천 CSV 로드
-> 결측치/중복/타입 처리
-> 평가 점수, 학습 활동, 수강 상태 지표 계산
-> data/mart/에 대시보드용 JSON 또는 CSV 생성

FastAPI
-> mart 데이터를 REST API로 제공
-> 대시보드 요약, 교육생 목록, 교육생 상세 지표 응답

React
-> FastAPI에서 받은 데이터를 차트와 테이블로 시각화
-> 필터와 상세 화면으로 교육생 역량 탐색
```

## OULAD 데이터

이 프로젝트는 Open University Learning Analytics Dataset(OULAD)을 사용합니다.

- 데이터 출처: https://archive.ics.uci.edu/dataset/349/open+university+learning+analytics+dataset
- 공식 설명: Open University의 온라인 학습 환경(VLE)에서 수집된 익명화 학습 분석 데이터셋
- 데이터 성격: 과정 정보, 교육생 정보, 수강 등록 정보, 평가 결과, 온라인 학습 활동 로그
- 활용 목적: 교육생 역량 지표 계산, 위험 교육생 탐지, 학습 활동과 평가 성취도 관계 분석

### 데이터 요약

| 항목 | 값 |
| --- | ---: |
| 압축 다운로드 크기 | 약 44.6 MB |
| 압축 해제 후 로컬 크기 | 약 442.9 MB |
| 전체 파일 수 | 8개 |
| CSV 파일 수 | 7개 |
| 설명 파일 수 | 1개 |
| CSV 데이터 행 수 합계 | 10,900,970행 |
| 고유 교육생 수 | 28,785명 |
| 수강 기록 수 | 32,593건 |
| 과정 모듈 수 | 7개 |
| 과정 개설 단위 수 | 22개 |

### 파일 요약

| 파일명 | 설명 | 로컬 크기 | 데이터 행 수 |
| --- | --- | ---: | ---: |
| `courses.csv` | 과정 코드, 과정 개설 시기, 과정 길이 | 0.00 MB | 22 |
| `assessments.csv` | 평가 정보, 평가 유형, 마감일, 가중치 | 0.01 MB | 206 |
| `studentInfo.csv` | 교육생 기본 정보, 수강 과정, 최종 결과 | 3.30 MB | 32,593 |
| `studentRegistration.csv` | 교육생별 등록일, 철회일 | 1.08 MB | 32,593 |
| `studentAssessment.csv` | 교육생별 평가 제출일, 평가 점수 | 5.43 MB | 173,912 |
| `studentVle.csv` | 교육생별 VLE 학습 활동 로그 | 432.81 MB | 10,655,280 |
| `vle.csv` | VLE 학습 자료 정보 | 0.26 MB | 6,364 |
| `OULAD.names` | 데이터셋 설명 파일 | 0.01 MB | 214 lines |

원천 데이터는 `data/raw/oulad/`에 보관합니다.

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

## 데이터 전처리 계획

### 1. Raw Validation

- CSV 파일 존재 여부 확인
- 컬럼명 확인
- 행 수 확인
- 중복 키 확인
- 결측치 비율 확인

### 2. Student Profile Processing

- `studentInfo.csv`와 `studentRegistration.csv` 조인
- 수강 상태 생성: completed, withdrawn
- `final_result`를 대시보드용 상태값으로 변환
- 교육생별 기본 프로필 테이블 생성

### 3. Assessment Processing

- `studentAssessment.csv`와 `assessments.csv` 조인
- 평가 제출 지연 여부 계산
- 평가 가중치 반영 점수 계산
- 교육생별 평균 점수, 제출률, 지연 제출률 계산

### 4. VLE Activity Processing

- `studentVle.csv`와 `vle.csv` 조인
- 일별 클릭 수 집계
- 주차별 학습 활동량 계산
- 활동 일수, 총 클릭 수, 평균 클릭 수 계산

### 5. Competency Metrics

OULAD 데이터의 실제 컬럼을 교육생 역량 지표로 매핑합니다.

- 학습 참여도: VLE 클릭 수, 활동 일수, 자료 접근 다양성
- 평가 성취도: 평가 점수, 가중 평균 점수
- 학습 성실도: 제출률, 지연 제출률, 학습 지속성
- 위험도: 낮은 활동량, 낮은 평가 점수, 철회 여부
- 성장 추이: 주차별 활동량과 평가 점수 변화

## Mart 데이터

FastAPI와 React가 바로 사용하기 좋은 최종 데이터를 `data/mart/`에 생성합니다.

```text
data/mart/
  dashboard_summary.json
  student_scores.json
  weekly_activity.json
  competency_scores.json
  risk_students.json
```

## React 프론트엔드 실습

- 대시보드 레이아웃 구현
- KPI 카드 컴포넌트 분리
- 교육생 목록 테이블 구현
- Recharts 기반 라인/막대/레이더 차트 구현
- 과정, 기간, 위험도 필터 구현
- 로딩, 빈 데이터, 에러 상태 처리
- API 응답 데이터를 화면 표시용 데이터로 변환

## Figma 및 와이어프레임 실습

Figma 기반 UI 구현 경험과 목업/와이어프레임을 실제 서비스 화면으로 구현하는 역량을 함께 실습합니다.

### Figma Practice

- 교육생 역량 대시보드 와이어프레임 작성
- PC 중심 대시보드 레이아웃 설계
- 색상, 타이포그래피, 간격, 카드, 테이블 스타일 정의
- KPI 카드, 필터, 차트, 테이블 컴포넌트 UI Spec 정리
- Figma 화면을 React 컴포넌트 구조로 분해

### Wireframe To Service UI

- 와이어프레임을 실제 React 페이지로 구현
- 정적 목업 화면에서 API 연동 화면으로 전환
- 더미 상태, 로딩 상태, 빈 데이터 상태, 에러 상태 반영
- 화면 요소를 재사용 가능한 컴포넌트로 분리
- PC 우선 레이아웃을 유지하면서 작은 화면에서도 깨지지 않게 조정

## FastAPI 백엔드 실습

- `GET /api/dashboard/summary`
- `GET /api/students`
- `GET /api/students/{student_id}`
- `GET /api/students/{student_id}/competencies`
- `GET /api/weekly-activity`
- `GET /api/risk-students`

FastAPI는 `data/mart/`의 JSON 또는 CSV 파일을 읽어 React에 전달합니다.

## Airflow 실습

Airflow는 OULAD 원천 데이터를 대시보드용 데이터로 만드는 역할을 담당합니다.

- OULAD CSV 로드 태스크
- 원천 데이터 검증 태스크
- 평가 데이터 전처리 태스크
- VLE 학습 활동 전처리 태스크
- 교육생별 역량 지표 계산 태스크
- mart JSON 생성 태스크

## Markdown 문서화 실습

Markdown을 활용해 진행 상황, 이슈, 결과물을 문서화하는 역량을 실습합니다.

```text
docs/
  progress.md               # 날짜별 진행 상황 기록
  issues.md                 # 막힌 점, 원인, 해결 과정 기록
  decisions.md              # 기술 선택과 설계 결정 기록
  api-spec.md               # FastAPI 엔드포인트 명세
  preprocessing.md          # 데이터 전처리 과정과 산출물 설명
  dashboard-result.md       # 최종 화면, 지표, 회고 정리
  design/
    wireframe.md            # 와이어프레임 설명
    figma-spec.md           # Figma 기반 UI 규칙 정리
    component-spec.md       # 컴포넌트 단위 UI 명세
```

문서화 규칙:

- 작업한 내용은 날짜별로 짧게 기록
- 문제가 생기면 원인, 시도한 방법, 해결 방법을 함께 기록
- API 응답 구조와 데이터 전처리 결과는 표로 정리
- 화면 구현 결과는 주요 컴포넌트 단위로 정리
- README에는 프로젝트 전체 요약을 유지하고, 상세 기록은 `docs/`에 분리

현재 문서 역할:

- `docs/progress.md`: 처음부터 현재까지의 작업 진행 기록
- `docs/decisions.md`: 프로젝트 주제, 기술 스택, 데이터셋 선택 이유
- `docs/issues.md`: 저장 충돌, 인코딩, 결측치, 대용량 CSV 처리 이슈
- `docs/preprocessing.md`: OULAD 원천 데이터 탐색 결과
- `docs/transform.md`: 전처리 산출물과 역량 지표 계산 결과
- `docs/study-notes.md`: 데이터 전처리 공부 포인트와 실무 참고 노트
- `docs/api-spec.md`: FastAPI 엔드포인트 명세와 실행 방법
- `docs/airflow.md`: Airflow DAG 구조와 자동화 흐름

## 프로젝트 구조

```text
airflow_practice/
  docs/                     # Markdown 기반 진행 상황, 설계, 이슈 문서
    design/                 # Figma/와이어프레임/UI 명세 문서
  frontend/                 # React 프론트엔드 앱
    src/                    # React 소스 코드
      api/                  # FastAPI 호출 함수 모음
      components/           # 재사용 가능한 UI 컴포넌트
        charts/             # Recharts 기반 차트 컴포넌트
        common/             # 버튼, 카드, 배지 등 공통 컴포넌트
        dashboard/          # 대시보드 전용 컴포넌트
        layout/             # 헤더, 사이드바, 페이지 레이아웃
      pages/                # 라우팅 단위 페이지
      styles/               # 전역 스타일, CSS 모듈, 디자인 토큰
  backend/                  # FastAPI 백엔드 서버
    app/                    # FastAPI 애플리케이션 코드
      main.py               # FastAPI 앱 시작점
      routers/              # API 엔드포인트 라우터
      schemas/              # Pydantic 요청/응답 스키마
      services/             # 데이터 조회, 지표 계산 비즈니스 로직
  dags/                     # Airflow DAG 정의
  data/                     # 원천/중간/최종 데이터 저장소
    raw/                    # 원본 데이터, OULAD CSV 보관
      oulad/                # OULAD 원천 CSV
    processed/              # 전처리된 중간 데이터
    mart/                   # FastAPI/React가 사용할 최종 집계 데이터
    mock/                   # 초기 화면 개발용 작은 샘플 데이터
  scripts/                  # 단독 실행 가능한 데이터 처리 스크립트
  README.md                 # 프로젝트 목표, 구조, 진행 상황 문서
```

## 첫 번째 마일스톤

1. OULAD CSV를 `data/raw/oulad/`에 배치
2. CSV 컬럼, 행 수, 결측치 확인 스크립트 작성
3. `studentInfo`, `studentAssessment`, `assessments` 조인 실습
4. 교육생별 평가 평균 점수 계산
5. `studentVle` 기반 주차별 학습 활동량 계산
6. `data/mart/dashboard_summary.json` 생성
7. FastAPI로 mart 데이터 반환
8. React에서 FastAPI API 연동
9. KPI 카드와 교육생 목록 테이블 구현
10. 대시보드 와이어프레임 작성
11. Figma 또는 Markdown 기반 UI Spec 작성
12. 와이어프레임을 React 화면으로 구현
13. 진행 상황과 이슈를 `docs/progress.md`, `docs/issues.md`에 기록
14. Airflow DAG로 전처리 흐름 자동화

## Git Policy

OULAD 원천 데이터는 용량이 크기 때문에 Git에 올리지 않습니다.

```gitignore
data/raw/
data/processed/
data/mart/
*.log
```
