from collections import defaultdict

from fastapi import APIRouter

from app.services.mart_loader import load_json_array


router = APIRouter()


def _aggregate(students: list[dict]) -> dict:
    total = len(students)
    if total == 0:
        return {}

    passed = sum(1 for s in students if s.get("final_result") in ("Pass", "Distinction"))
    distinction = sum(1 for s in students if s.get("final_result") == "Distinction")
    withdrawn = sum(1 for s in students if s.get("final_result") == "Withdrawn")
    high_risk = sum(1 for s in students if s.get("risk_level") == "high")
    medium_risk = sum(1 for s in students if s.get("risk_level") == "medium")
    low_risk = sum(1 for s in students if s.get("risk_level") == "low")

    avg = lambda key: round(sum(s.get(key, 0) or 0 for s in students) / total, 2)

    return {
        "total_students": total,
        "pass_rate": round(passed / total * 100, 1),
        "distinction_rate": round(distinction / total * 100, 1),
        "withdrawal_rate": round(withdrawn / total * 100, 1),
        "high_risk_rate": round(high_risk / total * 100, 1),
        "medium_risk_rate": round(medium_risk / total * 100, 1),
        "low_risk_rate": round(low_risk / total * 100, 1),
        "avg_competency_score": avg("competency_score"),
        "avg_assessment_score": avg("assessment_score"),
        "avg_engagement_score": avg("engagement_score"),
        "avg_diligence_score": avg("diligence_score"),
        "avg_submission_rate": avg("submission_rate"),
    }


@router.get("/programs")
def get_programs() -> list[dict]:
    students = load_json_array("student_scores.json")

    by_module: dict[str, list] = defaultdict(list)
    for s in students:
        module = s.get("code_module")
        if module:
            by_module[module].append(s)

    result = []
    for module, module_students in sorted(by_module.items()):
        stats = _aggregate(module_students)
        result.append({"code_module": module, **stats})

    return result
