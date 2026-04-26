from __future__ import annotations

import csv
from collections import defaultdict
from datetime import datetime
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT_DIR / "data" / "raw" / "oulad"
DOCS_DIR = ROOT_DIR / "docs"
OUTPUT_PATH = DOCS_DIR / "preprocessing.md"

CSV_FILES = [
    "courses.csv",
    "assessments.csv",
    "studentInfo.csv",
    "studentRegistration.csv",
    "studentAssessment.csv",
    "studentVle.csv",
    "vle.csv",
]

KEY_COLUMNS = {
    "code_module",
    "code_presentation",
    "id_student",
    "id_assessment",
    "id_site",
}

MISSING_MARKERS = {"", "?"}


def format_bytes(size: int) -> str:
    if size >= 1024 * 1024:
        return f"{size / (1024 * 1024):.2f} MB"
    if size >= 1024:
        return f"{size / 1024:.2f} KB"
    return f"{size} B"


def inspect_csv(path: Path) -> dict:
    missing_counts: dict[str, int] = defaultdict(int)
    key_values: dict[str, set[str]] = defaultdict(set)
    sample_values: dict[str, list[str]] = defaultdict(list)
    row_count = 0

    with path.open("r", encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        columns = reader.fieldnames or []

        for row in reader:
            row_count += 1
            for column in columns:
                value = (row.get(column) or "").strip()

                if value in MISSING_MARKERS:
                    missing_counts[column] += 1
                elif len(sample_values[column]) < 3 and value not in sample_values[column]:
                    sample_values[column].append(value)

                if column in KEY_COLUMNS and value:
                    key_values[column].add(value)

    return {
        "name": path.name,
        "size": path.stat().st_size,
        "rows": row_count,
        "columns": columns,
        "missing_counts": dict(missing_counts),
        "key_unique_counts": {key: len(values) for key, values in key_values.items()},
        "sample_values": dict(sample_values),
    }


def inspect_names_file(path: Path) -> dict:
    with path.open("r", encoding="utf-8-sig", errors="replace") as file:
        lines = file.readlines()

    return {
        "name": path.name,
        "size": path.stat().st_size,
        "lines": len(lines),
    }


def make_markdown(csv_reports: list[dict], names_report: dict | None) -> str:
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    total_size = sum(report["size"] for report in csv_reports)
    total_rows = sum(report["rows"] for report in csv_reports)

    lines: list[str] = [
        "# 데이터 탐색 기록",
        "",
        f"- 생성 시각: {now}",
        "- 데이터셋: Open University Learning Analytics Dataset(OULAD)",
        "- 원천 경로: `data/raw/oulad/`",
        f"- CSV 파일 수: {len(csv_reports)}개",
        f"- CSV 데이터 행 수 합계: {total_rows:,}행",
        f"- CSV 파일 크기 합계: {format_bytes(total_size)}",
        "",
        "## 파일 요약",
        "",
        "| 파일 | 크기 | 행 수 | 컬럼 수 | 주요 컬럼 |",
        "| --- | ---: | ---: | ---: | --- |",
    ]

    for report in csv_reports:
        key_columns = [column for column in report["columns"] if column in KEY_COLUMNS]
        key_text = ", ".join(f"`{column}`" for column in key_columns) or "-"
        lines.append(
            f"| `{report['name']}` | {format_bytes(report['size'])} | "
            f"{report['rows']:,} | {len(report['columns'])} | {key_text} |"
        )

    if names_report:
        lines.extend(
            [
                f"| `{names_report['name']}` | {format_bytes(names_report['size'])} | "
                f"{names_report['lines']:,} lines | - | 데이터셋 설명 파일 |",
            ]
        )

    lines.extend(
        [
            "",
            "## 컬럼 및 결측치",
            "",
        ]
    )

    for report in csv_reports:
        lines.extend(
            [
                f"### {report['name']}",
                "",
                "| 컬럼 | 결측치 수 | 샘플 값 |",
                "| --- | ---: | --- |",
            ]
        )

        for column in report["columns"]:
            missing_count = report["missing_counts"].get(column, 0)
            samples = ", ".join(f"`{value}`" for value in report["sample_values"].get(column, []))
            lines.append(f"| `{column}` | {missing_count:,} | {samples or '-'} |")

        lines.append("")

    lines.extend(
        [
            "## 조인 키 후보",
            "",
            "| 키 | 등장 파일 | 파일별 고유값 수 |",
            "| --- | --- | --- |",
        ]
    )

    for key in sorted(KEY_COLUMNS):
        appearances = []
        unique_counts = []

        for report in csv_reports:
            if key in report["columns"]:
                appearances.append(f"`{report['name']}`")
                unique_count = report["key_unique_counts"].get(key, 0)
                unique_counts.append(f"`{report['name']}`: {unique_count:,}")

        if appearances:
            lines.append(f"| `{key}` | {', '.join(appearances)} | {', '.join(unique_counts)} |")

    lines.extend(
        [
            "",
            "## 전처리 아이디어",
            "",
            "- `studentInfo.csv` + `studentRegistration.csv`를 `code_module`, `code_presentation`, `id_student` 기준으로 조인",
            "- `studentAssessment.csv` + `assessments.csv`를 `id_assessment` 기준으로 조인",
            "- `studentVle.csv` + `vle.csv`를 `code_module`, `code_presentation`, `id_site` 기준으로 조인",
            "- 평가 점수, 제출 지연 여부, 평가 가중치를 활용해 평가 성취도 계산",
            "- VLE 클릭 수와 활동 일수를 활용해 학습 참여도 계산",
            "- 낮은 평가 점수, 낮은 활동량, `Withdrawn` 결과를 활용해 위험 교육생 후보 산출",
            "",
            "## 다음 작업",
            "",
            "1. `studentInfo`, `studentRegistration` 조인 결과 생성",
            "2. `studentAssessment`, `assessments` 조인 결과 생성",
            "3. `studentVle`를 주차 단위로 집계",
            "4. `data/mart/dashboard_summary.json` 생성",
        ]
    )

    return "\n".join(lines) + "\n"


def main() -> None:
    DOCS_DIR.mkdir(parents=True, exist_ok=True)

    missing_files = [name for name in CSV_FILES if not (RAW_DIR / name).exists()]
    if missing_files:
        joined = ", ".join(missing_files)
        raise FileNotFoundError(f"Missing OULAD files in {RAW_DIR}: {joined}")

    csv_reports = [inspect_csv(RAW_DIR / name) for name in CSV_FILES]

    names_path = RAW_DIR / "OULAD.names"
    names_report = inspect_names_file(names_path) if names_path.exists() else None

    OUTPUT_PATH.write_text(make_markdown(csv_reports, names_report), encoding="utf-8-sig")
    print(f"Wrote {OUTPUT_PATH.relative_to(ROOT_DIR)}")


if __name__ == "__main__":
    main()
