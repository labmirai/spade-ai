"""Load Jashore map documents into Postgres, then delete the import files.

The API never reads these files to answer a request. They exist only so the
first boot can copy them into map_datasets. After the database row matches
the file checksum, the file is removed.
"""

import hashlib
import json
import logging
from pathlib import Path

from sqlalchemy import select, text

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models.map_dataset import MapDataset

logger = logging.getLogger(__name__)

MAX_IMPORT_BYTES = 8 * 1024 * 1024

# Fixed keys. Request paths never become filenames or SQL identifiers.
IMPORT_FILES = {
    "jessore.summary": "summary.json",
    "jessore.plan": "field_plan.json",
    "jessore.districts": "bangladesh_districts.geojson",
    "jessore.upazilas": "upazila_summary.geojson",
    "jessore.points": "points.geojson",
    "jessore.catalog": "data_catalog.json",
    "jessore.etl": "etl_report.json",
    "jessore.parts": "shapefile_parts.json",
}

SERVED_KEYS = {
    "summary": "jessore.summary",
    "plan": "jessore.plan",
    "districts": "jessore.districts",
    "upazilas": "jessore.upazilas",
    "points": "jessore.points",
}


def _import_root() -> Path | None:
    configured = Path(settings.MAP_DATA_DIR)
    if not configured.is_absolute():
        configured = Path.cwd() / configured
    candidates = (
        configured,
        Path(__file__).resolve().parents[2] / "data" / "jessore",
    )
    for candidate in candidates:
        if candidate.is_symlink() or not candidate.is_dir():
            continue
        return candidate.resolve()
    return None


def _read_json(path: Path) -> tuple[dict, str, int]:
    size = path.stat().st_size
    if size > MAX_IMPORT_BYTES:
        raise RuntimeError(f"{path.name} is larger than {MAX_IMPORT_BYTES} bytes")
    raw = path.read_bytes()
    try:
        body = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"{path.name} is not valid JSON") from exc
    if not isinstance(body, dict):
        raise RuntimeError(f"{path.name} must be a JSON object")
    return body, hashlib.sha256(raw).hexdigest(), len(raw)


async def import_map_datasets() -> None:
    root = _import_root()
    pending_delete: list[Path] = []

    async with AsyncSessionLocal() as session:
        await session.execute(text("SELECT pg_advisory_xact_lock(88213401)"))
        rows = await session.execute(select(MapDataset.dataset_key, MapDataset.sha256))
        stored = dict(rows.all())

        if root is not None:
            for key, filename in IMPORT_FILES.items():
                path = root / filename
                if path.is_symlink() or not path.is_file():
                    continue
                resolved = path.resolve()
                if resolved.parent != root:
                    logger.error("skipped map import outside the data directory: %s", filename)
                    continue
                body, digest, size = _read_json(resolved)
                current = stored.get(key)
                if current is None:
                    session.add(
                        MapDataset(
                            dataset_key=key,
                            body=body,
                            sha256=digest,
                            byte_size=size,
                        )
                    )
                    stored[key] = digest
                    pending_delete.append(resolved)
                elif current == digest:
                    pending_delete.append(resolved)
                else:
                    logger.error(
                        "database copy of %s does not match the import file; file kept",
                        filename,
                    )

        missing = [key for key in SERVED_KEYS.values() if key not in stored]
        if missing:
            logger.error("map datasets missing from database: %s", ", ".join(sorted(missing)))

        await session.commit()

    for path in pending_delete:
        path.unlink(missing_ok=True)
        logger.info("removed imported map file %s", path.name)
