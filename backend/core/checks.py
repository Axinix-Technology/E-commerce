from django.core.checks import Error, register, Tags
from core.registry.model_registry import ModelRegistry


@register(Tags.models)
def check_populate_engine_registrations(app_configs, **kwargs):
    """
    Registration-Time Enforcement (Section 21 & Golden Rule 11):
    Checks that every registered Master or Transaction model defines a status field
    controlled by 1 (Active) and 0 (Deactive).
    """
    errors = []
    registered_models = ModelRegistry.get_all()

    for name, meta in registered_models.items():
        if meta.table_type in ("master", "transaction"):
            model_cls = meta.model_class
            status_field = meta.status_field

            # Check if status field exists on the model
            has_field = False
            field_obj = None
            try:
                field_obj = model_cls._meta.get_field(status_field)
                has_field = True
            except Exception:
                has_field = hasattr(model_cls, status_field)

            if not has_field:
                errors.append(
                    Error(
                        f"Model '{name}' is registered as '{meta.table_type}' but does not define "
                        f"mandatory status field '{status_field}' for 0/1 active-deactive lifecycle control.",
                        hint=f"Add '{status_field} = models.SmallIntegerField(default=1, choices=[(1, 'Active'), (0, 'Deactive')], db_index=True)' to {model_cls.__name__}.",
                        obj=model_cls,
                        id="core.E001",
                    )
                )

    return errors
