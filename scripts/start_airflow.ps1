$ErrorActionPreference = "Stop"

$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$VenvPath = if ($env:AIRFLOW_PRACTICE_VENV) {
    $env:AIRFLOW_PRACTICE_VENV
} else {
    Join-Path $ProjectRoot ".venv-airflow"
}

Set-Location $ProjectRoot

$ActivateScript = Join-Path $VenvPath "Scripts\Activate.ps1"
if (-not (Test-Path $ActivateScript)) {
    Write-Error "Virtual environment not found: $VenvPath. Create it with: py -3.12 -m venv .venv-airflow"
}

. $ActivateScript

$env:AIRFLOW_HOME = Join-Path $ProjectRoot ".airflow-windows"
$env:AIRFLOW__CORE__DAGS_FOLDER = Join-Path $ProjectRoot "dags"
$env:AIRFLOW__CORE__LOAD_EXAMPLES = "False"

Write-Host "Project root: $ProjectRoot"
Write-Host "Airflow home: $env:AIRFLOW_HOME"
Write-Host "DAGs folder:  $env:AIRFLOW__CORE__DAGS_FOLDER"
Write-Host ""

airflow standalone
