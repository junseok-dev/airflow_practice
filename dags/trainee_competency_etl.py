from __future__ import annotations

import sys
import subprocess
from datetime import datetime, timedelta
from pathlib import Path

from airflow.providers.standard.operators.python import PythonOperator
from airflow.sdk import DAG


PROJECT_ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = PROJECT_ROOT / "data" / "raw" / "oulad"
MART_DIR = PROJECT_ROOT / "data" / "mart"
PYTHON_BIN = sys.executable
INSPECT_SCRIPT = PROJECT_ROOT / "scripts" / "inspect_oulad.py"
TRANSFORM_SCRIPT = PROJECT_ROOT / "scripts" / "transform_competency.py"

REQUIRED_RAW_FILES = [
    "assessments.csv",
    "courses.csv",
    "OULAD.names",
    "studentAssessment.csv",
    "studentInfo.csv",
    "studentRegistration.csv",
    "studentVle.csv",
    "vle.csv",
]

REQUIRED_MART_FILES = [
    "dashboard_summary.json",
    "student_scores.json",
    "weekly_activity.json",
    "competency_scores.json",
    "risk_students.json",
]


def run_project_script(script_path: Path) -> None:
    subprocess.run(
        [PYTHON_BIN, str(script_path)],
        cwd=PROJECT_ROOT,
        check=True,
    )


def check_raw_files() -> None:
    missing_files = [name for name in REQUIRED_RAW_FILES if not (RAW_DIR / name).exists()]

    if missing_files:
        joined = ", ".join(missing_files)
        raise FileNotFoundError(f"Missing required OULAD raw files: {joined}")


def validate_mart_outputs() -> None:
    missing_files = [name for name in REQUIRED_MART_FILES if not (MART_DIR / name).exists()]

    if missing_files:
        joined = ", ".join(missing_files)
        raise FileNotFoundError(f"Missing mart output files: {joined}")

    empty_files = [name for name in REQUIRED_MART_FILES if (MART_DIR / name).stat().st_size == 0]

    if empty_files:
        joined = ", ".join(empty_files)
        raise ValueError(f"Empty mart output files: {joined}")


default_args = {
    "owner": "airflow_practice",
    "depends_on_past": False,
    "retries": 1,
    "retry_delay": timedelta(minutes=5),
}


with DAG(
    dag_id="trainee_competency_etl",
    description="Transform OULAD raw data into dashboard mart data.",
    default_args=default_args,
    start_date=datetime(2026, 4, 26),
    schedule="0 2 * * *",  # 매일 새벽 2시 자동 실행
    catchup=False,
    tags=["oulad", "competency", "dashboard"],
) as dag:
    check_raw_files_task = PythonOperator(
        task_id="check_raw_files",
        python_callable=check_raw_files,
    )

    inspect_oulad_data_task = PythonOperator(
        task_id="inspect_oulad_data",
        python_callable=run_project_script,
        op_args=[INSPECT_SCRIPT],
    )

    transform_competency_data_task = PythonOperator(
        task_id="transform_competency_data",
        python_callable=run_project_script,
        op_args=[TRANSFORM_SCRIPT],
    )

    validate_mart_outputs_task = PythonOperator(
        task_id="validate_mart_outputs",
        python_callable=validate_mart_outputs,
    )

    (
        check_raw_files_task
        >> inspect_oulad_data_task
        >> transform_competency_data_task
        >> validate_mart_outputs_task
    )
