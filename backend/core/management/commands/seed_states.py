from django.core.management.base import BaseCommand
from catalogue.models import StateMaster


class Command(BaseCommand):
    help = "Seeds all 36 Indian States & Union Territories with statutory 2-digit GST state codes"

    def handle(self, *args, **options):
        self.stdout.write("Seeding statutory GST States and Union Territories...")

        states_data = [
            ("01", "Jammu and Kashmir", True),
            ("02", "Himachal Pradesh", False),
            ("03", "Punjab", False),
            ("04", "Chandigarh", True),
            ("05", "Uttarakhand", False),
            ("06", "Haryana", False),
            ("07", "Delhi", True),
            ("08", "Rajasthan", False),
            ("09", "Uttar Pradesh", False),
            ("10", "Bihar", False),
            ("11", "Sikkim", False),
            ("12", "Arunachal Pradesh", False),
            ("13", "Nagaland", False),
            ("14", "Manipur", False),
            ("15", "Mizoram", False),
            ("16", "Tripura", False),
            ("17", "Meghalaya", False),
            ("18", "Assam", False),
            ("19", "West Bengal", False),
            ("20", "Jharkhand", False),
            ("21", "Odisha", False),
            ("22", "Chhattisgarh", False),
            ("23", "Madhya Pradesh", False),
            ("24", "Gujarat", False),
            ("26", "Dadra and Nagar Haveli and Daman and Diu", True),
            ("27", "Maharashtra", False),
            ("29", "Karnataka", False),
            ("30", "Goa", False),
            ("31", "Lakshadweep", True),
            ("32", "Kerala", False),
            ("33", "Tamil Nadu", False),
            ("34", "Puducherry", True),
            ("35", "Andaman and Nicobar Islands", True),
            ("36", "Telangana", False),
            ("37", "Andhra Pradesh", False),
            ("38", "Ladakh", True),
        ]

        count = 0
        for code, name, is_ut in states_data:
            state, created = StateMaster.objects.update_or_create(
                code=code,
                defaults={
                    "name": name,
                    "tin": code,
                    "is_union_territory": is_ut,
                    "status": 1,
                }
            )
            count += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {count} statutory GST States & Union Territories!"))
