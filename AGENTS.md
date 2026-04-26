# AGENTS.md — 처음부터 현재까지 전체 환경 복구 가이드

> 이 파일은 프로젝트를 새 에이전트나 새 터미널에서 다시 열었을 때  
> **처음부터 현재 시점까지 무엇을 했고, 어떻게 환경을 되살리는지** 순서대로 설명합니다.  
> 자세한 진행 기록은 `docs/progress.md`를 확인하세요.

---

## 📁 프로젝트 기본 정보

| 항목 | 값 |
|------|-----|
| 프로젝트명 | `airflow_practice` |
| 목표 | OULAD 데이터 전처리 → FastAPI → React 교육생 역량 대시보드 |
| Windows 경로 | `C:\Workspaces\airflow_practice` |
| WSL 경로 | `/mnt/c/Workspaces/airflow_practice` |
| Python 가상환경 | `~/.venvs/airflow_practice_env` (WSL 홈에 위치) |
| Git 원격 | `origin/main` |

---

## 🗂️ 현재 폴더 구조

```text
airflow_practice/
├── AGENTS.md                  # 이 파일 — 전체 환경 복구 가이드
├── 에이전트.md                # 한국어 요약 안내
├── README.md                  # 프로젝트 개요
├── .gitignore                 # raw 데이터·venv·.airflow 제외
├── .local-notes.md            # Airflow 로그인 정보 (Git 제외)
│
├── backend/                   # FastAPI 백엔드
│   └── app/
│       ├── main.py            # FastAPI 앱, CORS, 라우터
│       └── services/
│           └── mart_loader.py # mart JSON lru_cache 로더
│
├── dags/                      # Airflow DAG
│   └── trainee_competency_etl.py
│
├── data/                      # 데이터 (Git 제외)
│   ├── raw/oulad/             # OULAD 원천 CSV (직접 복사 필요)
│   ├── processed/             # 전처리 결과 CSV
│   └── mart/                  # 대시보드용 JSON
│
├── docs/                      # 문서
│   ├── progress.md            # 날짜별 작업 기록
│   ├── airflow.md             # Airflow 구조 설명
│   ├── api-spec.md            # FastAPI 엔드포인트 명세
│   ├── preprocessing.md       # 데이터 탐색 결과
│   ├── transform.md           # 전처리 결과
│   ├── study-notes.md         # 개념 학습 노트
│   └── decisions.md           # 기술 결정 기록
│
├── frontend/                  # Vite + React 대시보드
│   ├── src/
│   │   ├── api/dashboardApi.js
│   │   └── components/        # KPI 카드, 차트, 테이블
│   ├── package.json
│   └── vite.config.js         # /api → FastAPI 프록시 설정
│
└── scripts/                   # Python 스크립트
    ├── inspect_oulad.py        # 원천 데이터 탐색
    ├── transform_competency.py # processed/mart 데이터 생성
    └── start_airflow.sh        # Airflow 실행 스크립트
```

---

## ✅ 지금까지 완료한 것 (요약)

| 단계 | 내용 | 상태 |
|------|------|------|
| 1 | 프로젝트 방향 설정 (교육생 역량 대시보드) | ✅ 완료 |
| 2 | OULAD 데이터셋 선정 및 `data/raw/oulad/` 배치 | ✅ 완료 |
| 3 | 폴더 구조 정리, README, .gitignore | ✅ 완료 |
| 4 | `inspect_oulad.py` 작성 및 데이터 탐색 | ✅ 완료 |
| 5 | `transform_competency.py` 작성, processed/mart 생성 | ✅ 완료 |
| 6 | FastAPI 백엔드 7개 엔드포인트 구현 | ✅ 완료 |
| 7 | Vite + React 기본 대시보드 구현 (KPI·차트·테이블) | ✅ 완료 |
| 8 | Airflow DAG 작성 (4개 태스크) | ✅ 완료 |
| 9 | WSL Ubuntu 환경 구축 + Airflow standalone 실행 | ✅ 완료 |
| 10 | **Airflow DAG 4개 태스크 전체 성공** | ✅ 완료 |

---

## 🚀 다음에 다시 작업할 때 — 순서대로 따라하기

### STEP 0. WSL 터미널 열기

Windows에서 Ubuntu(WSL) 터미널을 열거나, VS Code에서 `WSL: Reopen Folder in WSL`을 선택한다.

WSL 연결이 끊겼을 때만:

```powershell
# Windows PowerShell에서
wsl --shutdown
```

그 뒤 Ubuntu 터미널 재시작.

---

### STEP 1. 프로젝트 폴더 이동

```bash
cd /mnt/c/Workspaces/airflow_practice
```

---

### STEP 2. Python 가상환경 활성화

```bash
source ~/.venvs/airflow_practice_env/bin/activate
```

성공 시 프롬프트:

```text
(airflow_practice_env) user@machine:/mnt/c/Workspaces/airflow_practice$
```

> ⚠️ **가상환경이 없으면** (처음 세팅하거나 Ubuntu를 재설치한 경우):
>
> ```bash
> sudo apt update
> sudo apt install -y python3.12-venv python3-pip
> mkdir -p ~/.venvs
> python3 -m venv ~/.venvs/airflow_practice_env
> source ~/.venvs/airflow_practice_env/bin/activate
> python -m pip install --upgrade pip
> pip install apache-airflow pandas fastapi uvicorn pydantic
> ```
>
> `/mnt/c` 아래에 Linux venv를 만들면 `ensurepip`나 실행 권한 문제가 생기므로
> 반드시 WSL 홈(`~/.venvs/`)에 만든다.

---

### STEP 3. raw 데이터 확인

OULAD CSV 파일은 Git에 올라가 있지 않으므로 로컬에만 있다.
아래 경로에 파일이 있는지 확인한다.

```bash
ls data/raw/oulad/
```

있어야 하는 파일:

```text
assessments.csv
courses.csv
studentAssessment.csv
studentInfo.csv
studentRegistration.csv
studentVle.csv
vle.csv
```

> ⚠️ **파일이 없으면** OULAD 공식 사이트에서 다시 다운로드해 `data/raw/oulad/`에 복사한다.
> https://analyse.kmi.open.ac.uk/open_dataset

---

### STEP 4. 데이터 재생성 (필요할 때만)

`data/processed/`와 `data/mart/`도 Git 제외다.
처음 세팅하거나 데이터가 지워진 경우 아래 순서로 재생성한다.

```bash
# 4-1. 데이터 탐색 (결과를 화면에 출력)
python scripts/inspect_oulad.py

# 4-2. 전처리 및 mart 생성 (약 2~5분 소요)
python scripts/transform_competency.py
```

생성 확인:

```bash
ls data/processed/
ls data/mart/
```

생성되어야 하는 파일:

```text
data/processed/
  student_profiles.csv
  assessment_scores.csv
  weekly_activity.csv
  student_scores.csv

data/mart/
  dashboard_summary.json
  student_scores.json
  weekly_activity.json
  competency_scores.json
  risk_students.json
```

---

### STEP 5. Airflow 실행

#### 터미널 A — Airflow standalone

```bash
cd /mnt/c/Workspaces/airflow_practice
source ~/.venvs/airflow_practice_env/bin/activate
bash scripts/start_airflow.sh
```

또는 직접 실행:

```bash
export AIRFLOW_HOME="$PWD/.airflow"
export AIRFLOW__CORE__DAGS_FOLDER="$PWD/dags"
export AIRFLOW__CORE__LOAD_EXAMPLES=False
airflow standalone
```

접속: **http://localhost:8080**

로그인 정보는 `.local-notes.md` 확인.

> Airflow가 이미 실행 중이면 이 단계는 건너뜀.  
> DAG 수정 후 반영이 늦으면 `Ctrl+C`로 끄고 위 명령으로 다시 시작한다.

#### Airflow UI에서 DAG 실행

1. 브라우저에서 `http://localhost:8080` 접속
2. DAG 목록에서 `trainee_competency_etl` 찾기
3. 토글을 켜고 → `▶ Trigger DAG` 클릭
4. 4개 태스크 모두 초록색(성공) 확인

Airflow 3.x 기준 DAG import:

```python
from airflow.sdk import DAG
from airflow.providers.standard.operators.bash import BashOperator
from airflow.providers.standard.operators.python import PythonOperator
```

---

### STEP 6. FastAPI 백엔드 실행

**새 터미널 B**를 열고:

```bash
cd /mnt/c/Workspaces/airflow_practice
source ~/.venvs/airflow_practice_env/bin/activate
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

동작 확인:

```bash
curl http://127.0.0.1:8000/api/health
# 기대 결과: {"status":"ok"}
```

주요 엔드포인트:

| 경로 | 설명 |
|------|------|
| `GET /api/health` | 서버 상태 확인 |
| `GET /api/dashboard/summary` | KPI 요약 |
| `GET /api/students` | 교육생 목록 |
| `GET /api/students/{id}` | 교육생 상세 |
| `GET /api/students/{id}/competencies` | 역량 점수 |
| `GET /api/weekly-activity` | 주차별 활동 |
| `GET /api/risk-students` | 위험 교육생 목록 |

---

### STEP 7. React 프론트엔드 실행

**새 터미널 C**를 열고:

```bash
cd /mnt/c/Workspaces/airflow_practice/frontend
npm install       # 처음이거나 node_modules가 없을 때만
npm run dev
```

브라우저에서 접속: **http://127.0.0.1:5173**

> Vite proxy가 `/api` 요청을 자동으로 FastAPI(port 8000)로 전달한다.
> FastAPI가 켜져 있어야 데이터가 표시된다.

---

### STEP 8. 작업 후 Git 커밋

```bash
cd /mnt/c/Workspaces/airflow_practice

# 변경 파일 확인
git status

# 스테이징 (data/, .airflow/, node_modules/ 는 올리지 않음)
git add AGENTS.md 에이전트.md backend/ dags/ docs/ frontend/src/ scripts/ .gitignore README.md

# 커밋
git commit -m "feat: 작업 내용 요약"

# 푸시
git push origin main
```

---

## ⚠️ Git에 올리면 안 되는 것

```text
.local-notes.md        # Airflow 로그인 정보
.airflow/              # Airflow DB, 로그
data/raw/              # OULAD 원천 CSV (442 MB)
data/processed/        # 전처리 결과 CSV
data/mart/             # mart JSON
*.log                  # 실행 로그
frontend/node_modules/ # npm 패키지
frontend/dist/         # 빌드 결과
```

---

## 🔜 이어서 할 일 (현재 시점 기준)

1. **FastAPI + React 브라우저 연동 확인**
   - FastAPI(8000) + React(5173) 동시 실행 후 `http://127.0.0.1:5173`에서 데이터 표시 확인
   - 연동 안 되면 `vite.config.js` proxy target과 CORS 설정 점검

2. **React UI 디자인 개선**
   - 색상·폰트·레이아웃 개선
   - 주차별 활동 라인 차트, 역량 레이더 차트 추가
   - 위험 교육생 필터(전체 / 위험 / 고위험) 구현

3. **개별 교육생 상세 페이지 구현**
   - `react-router-dom` 설치 후 `/students/:id` 라우팅
   - 개인별 역량 점수, 주차별 활동 차트 표시

4. **Airflow 스케줄링 설정**
   - `dags/trainee_competency_etl.py`의 `schedule` 파라미터에 cron 추가
   - 예: `schedule="0 2 * * *"` (매일 새벽 2시 자동 실행)

5. **README 스크린샷 추가** — 포트폴리오용 문서 완성

---

## 🛠️ 트러블슈팅 메모

| 증상 | 해결 방법 |
|------|-----------|
| Airflow UI에 DAG가 안 보임 | `AIRFLOW__CORE__DAGS_FOLDER` 환경변수 확인, Airflow 재시작 |
| DAG 수정 후 반영 안 됨 | `Ctrl+C` 후 `bash scripts/start_airflow.sh` 재실행 |
| FastAPI import 오류 | 가상환경 활성화 확인, `pip install fastapi uvicorn pydantic` |
| React에서 API 응답 없음 | FastAPI 서버 실행 여부 확인, `vite.config.js` proxy target 확인 |
| `/mnt/c` 아래 venv 오류 | WSL 홈(`~/.venvs/`)에 가상환경을 만들어야 함 |
| `airflow.sdk` import 오류 | Airflow 3.x 이상 필요. `pip install apache-airflow --upgrade` |

---

## WSL에 Codex CLI 설치 메모

WSL은 Windows와 별도 실행 환경이다. Windows에 설치된 Codex/Claude Code가 WSL에 자동으로 들어오지 않는다.

먼저 WSL 안에서 Node/npm이 Linux 경로를 가리키는지 확인한다.

```bash
which node
which npm
node --version
npm --version
```

정상 예:

```text
/usr/bin/node
/usr/bin/npm
```

`node`가 없거나 npm이 Windows 경로를 쓰면 WSL 안에 설치한다.

```bash
sudo apt update
sudo apt install -y nodejs npm
hash -r
```

npm 전역 설치 위치를 홈으로 바꾼다.

```bash
mkdir -p ~/.npm-global
npm config set prefix ~/.npm-global
echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

Codex 설치:

```bash
npm install -g @openai/codex
codex --version
```

프로젝트에서 실행:

```bash
cd /mnt/c/Workspaces/airflow_practice
codex
```

이 설치는 WSL Ubuntu 안에 남는다. 터미널을 닫거나 재부팅해도 다시 설치할 필요가 없다.  
단, `wsl --unregister Ubuntu`로 Ubuntu 배포판을 삭제하면 사라진다.
