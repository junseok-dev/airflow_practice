from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

import pandas as pd


ROOT_DIR = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT_DIR / "data" / "raw" / "oulad"
PROCESSED_DIR = ROOT_DIR / "data" / "processed"
MART_DIR = ROOT_DIR / "data" / "mart"
DOCS_DIR = ROOT_DIR / "docs"

STUDENT_KEYS = ["code_module", "code_presentation", "id_student"]
MODULE_KEYS = ["code_module", "code_presentation"]
MISSING_VALUES = ["?"]


def ensure_dirs() -> None:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    MART_DIR.mkdir(parents=True, exist_ok=True)
    DOCS_DIR.mkdir(parents=True, exist_ok=True)


def read_csv(name: str, **kwargs) -> pd.DataFrame:
    return pd.read_csv(RAW_DIR / name, na_values=MISSING_VALUES, **kwargs)


def normalize_0_100(series: pd.Series) -> pd.Series:
    filled = series.fillna(0)
    upper = filled.quantile(0.95)
    if pd.isna(upper) or upper <= 0:
        return pd.Series(0, index=series.index)
    return (filled.clip(lower=0, upper=upper) / upper * 100).round(2)


def build_student_profiles() -> pd.DataFrame:
    info = read_csv("studentInfo.csv")
    registration = read_csv("studentRegistration.csv")

    profiles = info.merge(registration, on=STUDENT_KEYS, how="left")
    profiles["is_withdrawn"] = profiles["final_result"].eq("Withdrawn")
    profiles["completed_course"] = ~profiles["is_withdrawn"]
    profiles["registration_missing"] = profiles["date_registration"].isna()
    profiles["unregistration_missing"] = profiles["date_unregistration"].isna()

    profiles.to_csv(PROCESSED_DIR / "student_profiles.csv", index=False, encoding="utf-8-sig")
    return profiles


def build_assessment_scores() -> pd.DataFrame:
    assessments = read_csv("assessments.csv")
    student_assessment = read_csv("studentAssessment.csv")

    assessments["date"] = pd.to_numeric(assessments["date"], errors="coerce")
    assessments["weight"] = pd.to_numeric(assessments["weight"], errors="coerce").fillna(0)
    student_assessment["score"] = pd.to_numeric(student_assessment["score"], errors="coerce")
    student_assessment["date_submitted"] = pd.to_numeric(
        student_assessment["date_submitted"], errors="coerce"
    )

    merged = student_assessment.merge(assessments, on="id_assessment", how="left")
    merged["submitted_late"] = (
        merged["date"].notna() & merged["date_submitted"].gt(merged["date"])
    )
    merged["weighted_score"] = merged["score"] * merged["weight"] / 100
    merged["has_score"] = merged["score"].notna()

    scores = (
        merged.groupby(STUDENT_KEYS, dropna=False)
        .agg(
            assessment_count=("id_assessment", "count"),
            scored_assessment_count=("has_score", "sum"),
            average_score=("score", "mean"),
            weighted_score=("weighted_score", "sum"),
            submitted_late_count=("submitted_late", "sum"),
        )
        .reset_index()
    )
    scores["submission_rate"] = (
        scores["scored_assessment_count"] / scores["assessment_count"].replace(0, pd.NA) * 100
    ).round(2)
    scores["late_submission_rate"] = (
        scores["submitted_late_count"] / scores["assessment_count"].replace(0, pd.NA) * 100
    ).round(2)
    scores["average_score"] = scores["average_score"].round(2)
    scores["weighted_score"] = scores["weighted_score"].round(2)

    scores.to_csv(PROCESSED_DIR / "assessment_scores.csv", index=False, encoding="utf-8-sig")
    return scores


def build_weekly_activity(chunk_size: int = 500_000) -> pd.DataFrame:
    chunks: list[pd.DataFrame] = []
    usecols = ["code_module", "code_presentation", "id_student", "date", "sum_click"]

    for chunk in pd.read_csv(
        RAW_DIR / "studentVle.csv",
        usecols=usecols,
        chunksize=chunk_size,
        na_values=MISSING_VALUES,
    ):
        chunk["date"] = pd.to_numeric(chunk["date"], errors="coerce")
        chunk["sum_click"] = pd.to_numeric(chunk["sum_click"], errors="coerce").fillna(0)
        chunk = chunk.dropna(subset=["date"])
        chunk["week"] = (chunk["date"] // 7 + 1).astype(int)

        daily = (
            chunk.groupby(STUDENT_KEYS + ["week", "date"], dropna=False)
            .agg(total_clicks=("sum_click", "sum"))
            .reset_index()
        )
        chunks.append(daily)

    daily_activity = pd.concat(chunks, ignore_index=True)
    daily_activity = (
        daily_activity.groupby(STUDENT_KEYS + ["week", "date"], dropna=False)
        .agg(total_clicks=("total_clicks", "sum"))
        .reset_index()
    )

    weekly_activity = (
        daily_activity.groupby(STUDENT_KEYS + ["week"], dropna=False)
        .agg(total_clicks=("total_clicks", "sum"), active_days=("date", "nunique"))
        .reset_index()
    )
    weekly_activity["total_clicks"] = weekly_activity["total_clicks"].round(0).astype(int)

    weekly_activity.to_csv(PROCESSED_DIR / "weekly_activity.csv", index=False, encoding="utf-8-sig")
    weekly_activity.to_json(
        MART_DIR / "weekly_activity.json",
        orient="records",
        force_ascii=False,
        indent=2,
    )
    return weekly_activity


def build_student_scores(
    profiles: pd.DataFrame, assessment_scores: pd.DataFrame, weekly_activity: pd.DataFrame
) -> pd.DataFrame:
    activity_summary = (
        weekly_activity.groupby(STUDENT_KEYS, dropna=False)
        .agg(
            total_clicks=("total_clicks", "sum"),
            active_days=("active_days", "sum"),
            activity_weeks=("week", "nunique"),
        )
        .reset_index()
    )

    scores = profiles.merge(assessment_scores, on=STUDENT_KEYS, how="left")
    scores = scores.merge(activity_summary, on=STUDENT_KEYS, how="left")

    scores["assessment_score"] = scores["average_score"].fillna(0).round(2)
    scores["engagement_score"] = normalize_0_100(scores["total_clicks"])
    scores["diligence_score"] = (
        scores["submission_rate"].fillna(0) * 0.7
        + (100 - scores["late_submission_rate"].fillna(100)) * 0.3
    ).clip(lower=0, upper=100).round(2)
    scores["competency_score"] = (
        scores["assessment_score"] * 0.45
        + scores["engagement_score"] * 0.35
        + scores["diligence_score"] * 0.20
    ).round(2)

    scores["risk_level"] = "low"
    scores.loc[
        (scores["competency_score"] < 65)
        | (scores["assessment_score"] < 50)
        | (scores["engagement_score"] < 35),
        "risk_level",
    ] = "medium"
    scores.loc[
        scores["is_withdrawn"]
        | (scores["competency_score"] < 50)
        | ((scores["assessment_score"] < 40) & (scores["engagement_score"] < 30)),
        "risk_level",
    ] = "high"

    output_columns = [
        "code_module",
        "code_presentation",
        "id_student",
        "gender",
        "region",
        "highest_education",
        "age_band",
        "disability",
        "final_result",
        "assessment_count",
        "average_score",
        "weighted_score",
        "submission_rate",
        "late_submission_rate",
        "total_clicks",
        "active_days",
        "activity_weeks",
        "assessment_score",
        "engagement_score",
        "diligence_score",
        "competency_score",
        "risk_level",
    ]
    student_scores = scores[output_columns].copy()
    student_scores.to_csv(PROCESSED_DIR / "student_scores.csv", index=False, encoding="utf-8-sig")
    student_scores.to_json(
        MART_DIR / "student_scores.json",
        orient="records",
        force_ascii=False,
        indent=2,
    )
    return student_scores


def build_competency_scores(student_scores: pd.DataFrame) -> pd.DataFrame:
    competency_scores = student_scores[
        [
            "code_module",
            "code_presentation",
            "id_student",
            "assessment_score",
            "engagement_score",
            "diligence_score",
            "competency_score",
            "risk_level",
        ]
    ].copy()
    competency_scores.to_json(
        MART_DIR / "competency_scores.json",
        orient="records",
        force_ascii=False,
        indent=2,
    )
    return competency_scores


def build_risk_students(student_scores: pd.DataFrame) -> pd.DataFrame:
    risk_students = student_scores[student_scores["risk_level"].isin(["medium", "high"])].copy()
    risk_students["risk_reason"] = risk_students.apply(make_risk_reason, axis=1)
    risk_students = risk_students.sort_values(
        ["risk_level", "competency_score"], ascending=[True, True]
    )
    risk_students.to_json(
        MART_DIR / "risk_students.json",
        orient="records",
        force_ascii=False,
        indent=2,
    )
    return risk_students


def make_risk_reason(row: pd.Series) -> str:
    reasons = []
    if row.get("final_result") == "Withdrawn":
        reasons.append("수강 철회")
    if row.get("assessment_score", 0) < 50:
        reasons.append("낮은 평가 점수")
    if row.get("engagement_score", 0) < 35:
        reasons.append("낮은 학습 활동량")
    if row.get("competency_score", 0) < 65:
        reasons.append("낮은 종합 역량 점수")
    return ", ".join(reasons) if reasons else "관찰 필요"


def build_dashboard_summary(student_scores: pd.DataFrame, weekly_activity: pd.DataFrame) -> dict:
    total_students = int(student_scores["id_student"].nunique())
    total_registrations = int(len(student_scores))
    result_counts = student_scores["final_result"].value_counts().to_dict()
    risk_counts = student_scores["risk_level"].value_counts().to_dict()

    summary = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "total_students": total_students,
        "total_registrations": total_registrations,
        "average_assessment_score": round(float(student_scores["assessment_score"].mean()), 2),
        "average_engagement_score": round(float(student_scores["engagement_score"].mean()), 2),
        "average_diligence_score": round(float(student_scores["diligence_score"].mean()), 2),
        "average_competency_score": round(float(student_scores["competency_score"].mean()), 2),
        "total_clicks": int(weekly_activity["total_clicks"].sum()),
        "risk_student_count": int(student_scores["risk_level"].isin(["medium", "high"]).sum()),
        "high_risk_student_count": int(student_scores["risk_level"].eq("high").sum()),
        "final_result_counts": {str(key): int(value) for key, value in result_counts.items()},
        "risk_level_counts": {str(key): int(value) for key, value in risk_counts.items()},
    }

    (MART_DIR / "dashboard_summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2),
        encoding="utf-8-sig",
    )
    return summary


def write_transform_report(summary: dict, row_counts: dict[str, int]) -> None:
    lines = [
        "# 전처리 산출물 기록",
        "",
        f"- 생성 시각: {summary['generated_at']}",
        "- 입력 데이터: `data/raw/oulad/`",
        "- 중간 산출물: `data/processed/`",
        "- 대시보드 산출물: `data/mart/`",
        "",
        "## 생성 파일",
        "",
        "| 파일 | 행 수 | 설명 |",
        "| --- | ---: | --- |",
    ]

    descriptions = {
        "student_profiles.csv": "교육생 기본 정보와 수강 등록 정보 조인 결과",
        "assessment_scores.csv": "교육생별 평가 점수, 제출률, 지연 제출률",
        "weekly_activity.csv": "교육생별 주차별 VLE 학습 활동량",
        "student_scores.csv": "교육생별 종합 역량 점수",
        "dashboard_summary.json": "대시보드 KPI 요약",
        "student_scores.json": "교육생 목록/상세용 mart 데이터",
        "weekly_activity.json": "주차별 활동 차트용 mart 데이터",
        "competency_scores.json": "역량 차트용 mart 데이터",
        "risk_students.json": "위험 교육생 테이블용 mart 데이터",
    }

    for name, count in row_counts.items():
        lines.append(f"| `{name}` | {count:,} | {descriptions.get(name, '-')} |")

    lines.extend(
        [
            "",
            "## 대시보드 요약",
            "",
            f"- 고유 교육생 수: {summary['total_students']:,}명",
            f"- 수강 기록 수: {summary['total_registrations']:,}건",
            f"- 평균 평가 점수: {summary['average_assessment_score']}",
            f"- 평균 학습 참여 점수: {summary['average_engagement_score']}",
            f"- 평균 학습 성실도 점수: {summary['average_diligence_score']}",
            f"- 평균 종합 역량 점수: {summary['average_competency_score']}",
            f"- 위험 교육생 수: {summary['risk_student_count']:,}명",
            f"- 고위험 교육생 수: {summary['high_risk_student_count']:,}명",
            "",
            "## 산출 지표 정의",
            "",
            "- 평가 성취도: 평가 평균 점수 기반",
            "- 학습 참여도: 전체 VLE 클릭 수를 95분위 기준으로 0-100 정규화",
            "- 학습 성실도: 제출률 70%, 지연 제출률 30% 반영",
            "- 종합 역량 점수: 평가 성취도 45%, 학습 참여도 35%, 학습 성실도 20%",
            "- 위험도: 수강 철회, 낮은 평가 점수, 낮은 활동량, 낮은 종합 점수를 기준으로 분류",
        ]
    )

    (DOCS_DIR / "transform.md").write_text("\n".join(lines) + "\n", encoding="utf-8-sig")


def main() -> None:
    ensure_dirs()

    profiles = build_student_profiles()
    assessment_scores = build_assessment_scores()
    weekly_activity = build_weekly_activity()
    student_scores = build_student_scores(profiles, assessment_scores, weekly_activity)
    competency_scores = build_competency_scores(student_scores)
    risk_students = build_risk_students(student_scores)
    summary = build_dashboard_summary(student_scores, weekly_activity)

    row_counts = {
        "student_profiles.csv": len(profiles),
        "assessment_scores.csv": len(assessment_scores),
        "weekly_activity.csv": len(weekly_activity),
        "student_scores.csv": len(student_scores),
        "dashboard_summary.json": 1,
        "student_scores.json": len(student_scores),
        "weekly_activity.json": len(weekly_activity),
        "competency_scores.json": len(competency_scores),
        "risk_students.json": len(risk_students),
    }
    write_transform_report(summary, row_counts)

    print("Created processed and mart data:")
    for name, count in row_counts.items():
        print(f"- {name}: {count:,}")


if __name__ == "__main__":
    main()
