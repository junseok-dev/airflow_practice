# Airflow DAG 정리

이 문서는 OULAD 전처리 과정을 Airflow DAG로 자동화한 내용을 정리합니다.

## DAG 목적

수동으로 실행하던 데이터 탐색/전처리 스크립트를 Airflow 태스크로 묶어, 대시보드용 mart 데이터 생성 흐름을 자동화합니다.

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

Airflow는 Windows Python이 아니라 WSL Ubuntu 가상환경에서 실행합니다.

현재 기준:

- WSL Ubuntu 설치 완료
- Python 가상환경 `~/.venvs/airflow_practice_env` 생성 완료
- Airflow standalone 로그인 완료
- DAG 파일 작성 완료
- Airflow 3.x import 경로 반영 완료

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
