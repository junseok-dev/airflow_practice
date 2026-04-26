from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any


ROOT_DIR = Path(__file__).resolve().parents[3]
MART_DIR = ROOT_DIR / "data" / "mart"


def get_mart_path(filename: str) -> Path:
    path = MART_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"Mart file not found: {path}")
    return path


@lru_cache(maxsize=16)
def load_json(filename: str) -> Any:
    path = get_mart_path(filename)
    with path.open("r", encoding="utf-8-sig") as file:
        return json.load(file)


def load_json_object(filename: str) -> dict:
    data = load_json(filename)
    if not isinstance(data, dict):
        raise TypeError(f"Expected JSON object in {filename}")
    return data


def load_json_array(filename: str) -> list[dict]:
    data = load_json(filename)
    if not isinstance(data, list):
        raise TypeError(f"Expected JSON array in {filename}")
    return data
