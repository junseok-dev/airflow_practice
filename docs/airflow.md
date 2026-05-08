# Airflow DAG 정리

이 문서는 OULAD 전처리 과정을 Airflow DAG로 자동화한 내용을 정리합니다.

## DAG 목적

수동으로 실행하던 데이터 탐색/전처리 스크립트를 Airflow 태스크로 묶어, 대시보드용 mart 데이터 생성 흐름을 자동화합니다.

이 프로젝트에서 Airflow는 분석 로직을 직접 담는 곳이 아니라, 이미 분리해 둔 Python 스크립트를 정해진 순서로 실행하고 실패 여부를 확인하는 오케스트레이션 도구로 사용했습니다.

역할 분리:

| 영역 | 담당 |
| --- | --- |
| `scripts/inspect_oulad.py` | 원천 CSV 구조, 행 수, 결측치, 조인 키 후보 탐색 |
| `scripts/transform_competency.py` | processed CSV와 mart JSON 생성 |
| `dags/trainee_competency_etl.py` | 실행 순서, 실패 처리, 산출물 검증 |
| FastAPI | mart JSON을 REST API로 제공 |
| React | API 데이터를 차트와 테이블로 시각화 |

수동 실행 흐름:

```bash
python scripts/inspect_oulad.py
python scripts/transform_competency.py
```

Airflow 자동화 흐름:

```text
check_raw_files
↓
inspect_oulad_data
↓
transform_competency_data
↓
validate_mart_outputs
```

## DAG 파일

```text
dags/trainee_competency_etl.py
```

## DAG 구현 방식

처음에는 스크립트 실행 태스크를 `BashOperator`로 구성했습니다. WSL Ubuntu에서는 정상 실행됐지만, Windows 네이티브 환경에서는 bash 의존성이 부담이 될 수 있어 현재 DAG는 `PythonOperator`와 `subprocess.run()`으로 프로젝트 스크립트를 실행합니다.

현재 태스크 구성:

| 순서 | 태스크 | 구현 | 하는 일 |
| ---: | --- | --- | --- |
| 1 | `check_raw_files` | `PythonOperator` | OULAD 필수 raw CSV 존재 여부 확인 |
| 2 | `inspect_oulad_data` | `PythonOperator` + `subprocess.run()` | `scripts/inspect_oulad.py` 실행 |
| 3 | `transform_competency_data` | `PythonOperator` + `subprocess.run()` | `scripts/transform_competency.py` 실행 |
| 4 | `validate_mart_outputs` | `PythonOperator` | mart JSON 존재 여부와 빈 파일 여부 확인 |

이렇게 분리해두면 Airflow 없이도 같은 전처리 로직을 Windows PowerShell에서 실행할 수 있고, Airflow를 사용할 때는 UI에서 실행 이력, 성공/실패, 로그를 확인할 수 있습니다.

## Windows 실행 메모

Airflow는 공식 문서에서 PyPI, Docker, Helm, managed service 같은 설치 경로를 안내하지만, Windows 네이티브 실행은 공식적으로 권장되는 경로가 아닙니다. 실제로 Airflow 3.2.0 CLI는 Windows에서 POSIX 전용 `fcntl` 모듈을 찾다가 실패할 수 있습니다.

이 프로젝트에서는 Windows에서도 전처리 흐름을 계속 실습할 수 있도록 DAG의 스크립트 실행을 `BashOperator`가 아니라 `PythonOperator` 기반으로 구성했고, Airflow 없이 같은 순서를 실행하는 PowerShell 스크립트를 제공합니다.

Windows에서 ETL만 실행:

```powershell
cd C:\Workspaces\airflow_practice
powershell -ExecutionPolicy Bypass -File .\scripts\run_etl_windows.ps1
```

이 스크립트는 Airflow DAG와 같은 순서로 실행합니다.

```text
check_raw_files
inspect_oulad_data
transform_competency_data
validate_mart_outputs
```

Windows에서 시도할 때는 프로젝트 루트에서 별도 가상환경을 만듭니다.

```powershell
cd C:\Workspaces\airflow_practice
python -m venv .venv-airflow
.\.venv-airflow\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install --no-cache-dir "apache-airflow==3.2.0" pandas fastapi uvicorn pydantic --constraint "https://raw.githubusercontent.com/apache/airflow/constraints-3.2.0/constraints-3.12.txt"
```

실행:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start_airflow.ps1
```

단, Windows 네이티브 Airflow CLI가 `ModuleNotFoundError: No module named 'fcntl'`로 실패하면 WSL2 또는 Linux container가 필요합니다.

이 스크립트는 다음 값을 사용합니다.

```text
AIRFLOW_HOME=C:\Workspaces\airflow_practice\.airflow-windows
AIRFLOW__CORE__DAGS_FOLDER=C:\Workspaces\airflow_practice\dags
AIRFLOW__CORE__LOAD_EXAMPLES=False
```

접속:

```text
http://localhost:8080
```

Windows에서 Airflow 설치나 실행이 막히면, 데이터 파이프라인 자체는 아래 명령으로 계속 검증할 수 있습니다.

```powershell
python scripts/inspect_oulad.py
python scripts/transform_competency.py
```

## Docker Compose 실행 방법

Windows 네이티브 Airflow CLI가 `fcntl` 문제로 막히는 경우 Docker 컨테이너에서 Airflow를 실행할 수 있습니다. 공식 Airflow 문서도 Docker Compose quick start를 제공하며, Airflow 3.2.0 기준 compose 서비스에는 scheduler, dag processor, api server, worker, triggerer, init, postgres 등이 포함됩니다.

이 프로젝트에서는 학습용으로 더 가벼운 단일 컨테이너 `airflow standalone` 구성을 사용합니다.

파일:

```text
Dockerfile.airflow
docker-compose.yaml
scripts/start_airflow_docker.ps1
```

실행:

```powershell
cd C:\Workspaces\airflow_practice
powershell -ExecutionPolicy Bypass -File .\scripts\start_airflow_docker.ps1
```

또는 직접 실행:

```powershell
docker compose up --build
```

중지:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\stop_airflow_docker.ps1
```

접속:

```text
http://localhost:8080
```

컨테이너 안의 주요 마운트:

| 호스트 | 컨테이너 | 역할 |
| --- | --- | --- |
| `./dags` | `/opt/airflow/dags` | DAG 파일 |
| `./scripts` | `/opt/airflow/scripts` | 전처리 스크립트 |
| `./data` | `/opt/airflow/data` | raw/processed/mart 데이터 |
| `./docs` | `/opt/airflow/docs` | 탐색/전처리 문서 |
| `./.airflow-docker` | `/opt/airflow-home` | Airflow DB, 로그, 로컬 상태 |

로그와 Airflow 로컬 상태는 Git에 올리지 않습니다.

주의:

- 실행 전 Docker Desktop이 켜져 있어야 합니다.
- `failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine`가 나오면 Docker Desktop을 먼저 시작합니다.
- Docker build context에 원천 데이터와 `node_modules`가 포함되지 않도록 `.dockerignore`를 둡니다.

## WSL 실행 방법

Airflow는 WSL Ubuntu의 가상환경 `airflow_practice_env`에서 실행합니다.

가상환경 위치:

```text
~/.venvs/airflow_practice_env
```

프로젝트 경로:

```text
/mnt/c/Workspaces/airflow_practice
```

실행:

```bash
cd /mnt/c/Workspaces/airflow_practice
bash scripts/start_airflow.sh
```

직접 실행할 때는 다음 환경변수를 사용합니다.

```bash
cd /mnt/c/Workspaces/airflow_practice
source ~/.venvs/airflow_practice_env/bin/activate

export AIRFLOW_HOME="$PWD/.airflow"
export AIRFLOW__CORE__DAGS_FOLDER="$PWD/dags"
export AIRFLOW__CORE__LOAD_EXAMPLES=False

airflow standalone
```

접속:

```text
http://localhost:8080
```

로그인 정보는 Git에 올리지 않는 로컬 파일 `.local-notes.md`에 보관합니다.

## 태스크 설명

### check_raw_files

역할:

- `data/raw/oulad/`에 필수 OULAD 원천 파일이 모두 있는지 확인합니다.

확인 파일:

```text
assessments.csv
courses.csv
OULAD.names
studentAssessment.csv
studentInfo.csv
studentRegistration.csv
studentVle.csv
vle.csv
```

### inspect_oulad_data

역할:

- `scripts/inspect_oulad.py`를 실행합니다.
- 원천 CSV의 파일 크기, 행 수, 컬럼, 결측치, 조인 키 후보를 확인합니다.
- 결과를 `docs/preprocessing.md`에 저장합니다.

### transform_competency_data

역할:

- `scripts/transform_competency.py`를 실행합니다.
- OULAD 원천 데이터를 조인/집계해 processed와 mart 데이터를 생성합니다.

생성 데이터:

```text
data/processed/student_profiles.csv
data/processed/assessment_scores.csv
data/processed/weekly_activity.csv
data/processed/student_scores.csv

data/mart/dashboard_summary.json
data/mart/student_scores.json
data/mart/weekly_activity.json
data/mart/competency_scores.json
data/mart/risk_students.json
```

### validate_mart_outputs

역할:

- `data/mart/`에 필요한 JSON 파일이 모두 생성됐는지 확인합니다.
- 파일이 없거나 비어 있으면 DAG를 실패 처리합니다.

## 현재 환경 메모

Airflow DAG는 WSL Ubuntu에서 실제 실행 성공을 확인했습니다. Windows 네이티브에서는 Airflow 3.2.0 설치까지 가능했지만 CLI 실행 중 POSIX 전용 `fcntl` 모듈 문제로 막혀, Windows에서는 PowerShell ETL 스크립트로 같은 흐름을 검증합니다.

현재 기준:

- WSL Ubuntu 설치 완료
- Python 가상환경 `~/.venvs/airflow_practice_env` 생성 완료
- Airflow standalone 로그인 완료
- DAG 파일 작성 완료
- Airflow 3.x import 경로 반영 완료
- Windows용 `.venv-airflow` 설치 시도 완료
- Windows Airflow CLI의 `fcntl` 문제 확인
- `scripts/run_etl_windows.ps1`로 Windows ETL 실행 성공

Airflow DAG 코드를 수정한 뒤 UI 반영이 늦으면 실행 중인 `airflow standalone`을 `Ctrl + C`로 끄고 다시 시작합니다.

## DAG 수동 실행

Airflow UI에서 다음 순서로 실행합니다.

1. `trainee_competency_etl` DAG를 찾습니다.
2. DAG 토글을 켭니다.
3. `Trigger DAG`를 누릅니다.
4. 네 태스크가 모두 성공하는지 확인합니다.

성공해야 하는 태스크:

```text
check_raw_files
inspect_oulad_data
transform_competency_data
validate_mart_outputs
```

## 실무에서 알아둘 점

- Airflow는 데이터를 직접 처리하는 도구라기보다, 처리 작업을 순서대로 실행하고 관리하는 오케스트레이션 도구입니다.
- 실제 데이터 처리 로직은 `scripts/`의 Python 코드에 두고, DAG는 실행 순서와 실패 관리에 집중하는 편이 좋습니다.
- DAG 안에 긴 전처리 코드를 직접 넣기보다, 재사용 가능한 스크립트나 함수로 분리하는 것이 유지보수에 좋습니다.
- 마지막 검증 태스크를 두면 중간 태스크가 성공했더라도 산출물이 제대로 만들어졌는지 확인할 수 있습니다.
