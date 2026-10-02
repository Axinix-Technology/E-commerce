from typing import Any
from django.db.models import QuerySet, Count, Sum, Avg, Min, Max
from core.pipeline.context import RequestContext
from .base import BaseCRUDExecutor


class ReportExecutor(BaseCRUDExecutor):
    """
    Stage 08 — Generic Report & Statistics Executor.
    Executes aggregations, summaries, and reporting datasets.
    """

    @classmethod
    def execute(cls, queryset: QuerySet, context: RequestContext) -> dict[str, Any]:
        service = cls.get_service(context)
        queryset = service.before_read(context, queryset)

        # 1. Custom Domain Service Report Delegation
        custom_report = service.execute_report(context, queryset)
        if custom_report is not None:
            items = custom_report.get("data", custom_report.get("items", custom_report))
            count = custom_report.get("count", len(items) if isinstance(items, list) else 1)
            summary = custom_report.get("summary")
            metadata = custom_report.get("metadata")
            result = {
                "items": items,
                "count": count,
                "is_single": False,
            }
            if summary:
                result["summary"] = summary
            if metadata:
                result["metadata"] = metadata
            return result

        action = context.action

        if action == "statistics":
            # Basic stats summary
            total_active = queryset.count()
            data = {
                "total_records": total_active,
                "model": context.model_name,
            }
            return {
                "items": data,
                "count": 1,
                "is_single": True,
            }

        # For report action: fetch records or aggregates
        report_fields = context.fields
        if report_fields:
            valid_fields = [f for f in report_fields if hasattr(context.model_cls, f)]
            if valid_fields:
                items = list(queryset.values(*valid_fields))
            else:
                items = list(queryset)
        else:
            items = list(queryset)

        return {
            "items": items,
            "count": len(items),
            "is_single": False,
        }
