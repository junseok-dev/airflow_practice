$ErrorActionPreference = "Stop"

$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$RawDir = Join-Path $ProjectRoot "data\raw\oulad"
$MartDir = Join-Path $ProjectRoot "data\mart"

$RequiredRawFiles = @(
    "assessments.csv",
    "courses.csv",
    "OULAD.names",
    "studentAssessment.csv",
    "studentInfo.csv",
    "studentRegistration.csv",
    "studentVle.csv",
    "vle.csv"
)

$RequiredMartFiles = @(
    "dashboard_summary.json",
    "student_scores.json",
    "weekly_activity.json",
    "competency_scores.json",
    "risk_students.json"
)

Set-Location $ProjectRoot

$missingRawFiles = $RequiredRawFiles | Where-Object {
    -not (Test-Path (Join-Path $RawDir $_))
}

if ($missingRawFiles.Count -gt 0) {
    throw "Missing required OULAD raw files: $($missingRawFiles -join ', ')"
}

Write-Host "[1/4] Raw files checked"

Write-Host "[2/4] Inspecting OULAD files"
python scripts\inspect_oulad.py

Write-Host "[3/4] Transforming competency data"
python scripts\transform_competency.py

$missingMartFiles = $RequiredMartFiles | Where-Object {
    -not (Test-Path (Join-Path $MartDir $_))
}

if ($missingMartFiles.Count -gt 0) {
    throw "Missing mart output files: $($missingMartFiles -join ', ')"
}

$emptyMartFiles = $RequiredMartFiles | Where-Object {
    (Get-Item (Join-Path $MartDir $_)).Length -eq 0
}

if ($emptyMartFiles.Count -gt 0) {
    throw "Empty mart output files: $($emptyMartFiles -join ', ')"
}

Write-Host "[4/4] Mart outputs validated"
Write-Host "ETL completed successfully"
