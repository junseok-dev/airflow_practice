from fastapi import APIRouter, HTTPException, Query

from app.services.mart_loader import load_json_array


router = APIRouter()

SORTABLE_FIELDS = {
    "assessment_score", "engagement_score", "diligence_score",
    "competency_score", "total_clicks", "active_days",
}


def paginate(items: list[dict], limit: int, offset: int) -> dict:
    return {
        "total": len(items),
        "limit": limit,
        "offset": offset,
        "items": items[offset : offset + limit],
    }


@router.get("/students")
def get_students(
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    risk_level: str | None = Query(default=None, pattern="^(low|medium|high)$"),
    code_module: str | None = None,
    sort_by: str | None = None,
    sort_order: str = Query(default="desc", pattern="^(asc|desc)$"),
) -> dict:
    students = load_json_array("student_scores.json")

    if risk_level:
        students = [student for student in students if student.get("risk_level") == risk_level]
    if code_module:
        students = [student for student in students if student.get("code_module") == code_module]

    if sort_by and sort_by in SORTABLE_FIELDS:
        reverse = sort_order == "desc"
        students = sorted(students, key=lambda s: s.get(sort_by) or 0, reverse=reverse)

    return paginate(students, limit, offset)


@router.get("/students/{student_id}")
def get_student_detail(student_id: int) -> dict:
    students = load_json_array("student_scores.json")
    matches = [student for student in students if student.get("id_student") == student_id]

    if not matches:
        raise HTTPException(status_code=404, detail="Student not found")

    return {"student_id": student_id, "registrations": matches}


@router.get("/students/{student_id}/competencies")
def get_student_competencies(student_id: int) -> dict:
    competencies = load_json_array("competency_scores.json")
    matches = [item for item in competencies if item.get("id_student") == student_id]

    if not matches:
        raise HTTPException(status_code=404, detail="Student competencies not found")

    return {"student_id": student_id, "items": matches}


@router.get("/weekly-activity")
def get_weekly_activity(
    student_id: int | None = None,
    code_module: str | None = None,
    limit: int = Query(default=500, ge=1, le=5000),
    offset: int = Query(default=0, ge=0),
) -> dict:
    activity = load_json_array("weekly_activity.json")

    if student_id is not None:
        activity = [item for item in activity if item.get("id_student") == student_id]
    if code_module:
        activity = [item for item in activity if item.get("code_module") == code_module]

    return paginate(activity, limit, offset)


@router.get("/risk-students")
def get_risk_students(
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    risk_level: str | None = Query(default=None, pattern="^(medium|high)$"),
) -> dict:
    students = load_json_array("risk_students.json")

    if risk_level:
        students = [student for student in students if student.get("risk_level") == risk_level]

    # 어느 정도 활동한 학생(total_clicks > 0)을 우선 표시하고,
    # 그 안에서 competency_score 오름차순 정렬 (가장 위험한 학생 상단)
    students = sorted(
        students,
        key=lambda s: (
            s.get("total_clicks") is None or s.get("total_clicks", 0) == 0,
            s.get("competency_score", 0),
        ),
    )

    return paginate(students, limit, offset)
