from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Any


ROOT_DIR = Path(__file__).resolve().parents[3]
MART_DIR = ROOT_DIR / "data" / "mart"

TTL_SECONDS = 600  # 10분마다 파일 재로드

_cache: dict[str, tuple[Any, float]] = {}


def get_mart_path(filename: str) -> Path:
    path = MART_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"Mart file not found: {path}")
    return path


def load_json(filename: str) -> Any:
    now = time.monotonic()
    cached_value, cached_at = _cache.get(filename, (None, 0.0))

    if cached_value is not None and now - cached_at < TTL_SECONDS:
        return cached_value

    path = get_mart_path(filename)
    with path.open("r", encoding="utf-8-sig") as file:
        data = json.load(file)

    _cache[filename] = (data, now)
    return data


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
