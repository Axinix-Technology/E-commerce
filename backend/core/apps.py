from django.apps import AppConfig


class CoreConfig(AppConfig):
    name = 'core'
    verbose_name = 'Populate Engine Core'

    def ready(self):
        # Register system checks
        import core.checks  # noqa
        # Auto-register all domain services
        try:
            import services  # noqa
        except ImportError:
            pass
