from fastapi import APIRouter

from app.services.mart_loader import load_json_object


router = APIRouter()


@router.get("/summary")
def get_dashboard_summary() -> dict:
    return load_json_object("dashboard_summary.json")
