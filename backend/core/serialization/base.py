from datetime import date, datetime
from decimal import Decimal
import uuid
from typing import Any
from django.db import models


def serialize_value(val: Any) -> Any:
    """Serializes primitive/complex Python and Django types into JSON-compatible values."""
    if val is None:
        return None
    if isinstance(val, (str, int, float, bool)):
        return val
    if isinstance(val, (datetime, date)):
        return val.isoformat()
    if isinstance(val, Decimal):
        return float(val)
    if isinstance(val, uuid.UUID):
        return str(val)
    if isinstance(val, (list, tuple, set)):
        return [serialize_value(v) for v in val]
    if isinstance(val, dict):
        return {k: serialize_value(v) for k, v in val.items()}
    if hasattr(val, "all") and callable(getattr(val, "all")):  # RelatedManager / ManyToMany
        return [serialize_value(item.pk if hasattr(item, "pk") else item) for item in val.all()]
    if hasattr(val, "url"):  # ImageField / FileField
        return val.url
    return str(val)
