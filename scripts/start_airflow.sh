#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV_PATH="${AIRFLOW_PRACTICE_VENV:-$HOME/.venvs/airflow_practice_env}"

cd "$PROJECT_ROOT"

if [[ ! -f "$VENV_PATH/bin/activate" ]]; then
  echo "Virtual environment not found: $VENV_PATH" >&2
  echo "Create it first, then install Airflow dependencies." >&2
  exit 1
fi

# shellcheck source=/dev/null
source "$VENV_PATH/bin/activate"

export AIRFLOW_HOME="$PROJECT_ROOT/.airflow"
export AIRFLOW__CORE__DAGS_FOLDER="$PROJECT_ROOT/dags"
export AIRFLOW__CORE__LOAD_EXAMPLES=False

echo "Project root: $PROJECT_ROOT"
echo "Airflow home: $AIRFLOW_HOME"
echo "DAGs folder:  $AIRFLOW__CORE__DAGS_FOLDER"
echo

exec airflow standalone
