import hashlib
from django.core.management.base import BaseCommand
from django.db import transaction
from django.conf import settings
from rest_framework.authtoken.models import Token
from users.models import Role, User


DEFAULT_ROLES = [
    {
        "name": "Super Admin",
        "description": "Super Administrator with full platform access",
        "is_superadmin": True,
    },
    {
        "name": "Store Manager",
        "description": "Store Manager responsible for store operations",
        "is_superadmin": False,
    },
    {
        "name": "Staff",
        "description": "Staff operator",
        "is_superadmin": False,
    },
]


class Command(BaseCommand):
    help = "Seed default roles and provision initial developer superadmin user."

    def add_arguments(self, parser):
        parser.add_argument("--username", default="developer", help="Developer username (default: developer)")
        parser.add_argument("--password", default="Developer@123", help="Developer password (default: Developer@123)")
        parser.add_argument("--email", default="developer@axinix.com", help="Developer email (default: developer@axinix.com)")
        parser.add_argument("--first-name", default="System", help="First name (default: System)")
        parser.add_argument("--last-name", default="Developer", help="Last name (default: Developer)")

    def handle(self, *args, **options):
        username = options["username"]
        password = options["password"]
        email = options["email"]
        first_name = options["first_name"]
        last_name = options["last_name"]

        active_db = settings.DATABASES['default']
        self.stdout.write(self.style.MIGRATE_HEADING("=" * 60))
        self.stdout.write(self.style.MIGRATE_HEADING(" AXINIX E-COMMERCE PLATFORM - INITIAL DB SETUP"))
        self.stdout.write(self.style.MIGRATE_HEADING("=" * 60))
        self.stdout.write(f" Target Database : {active_db.get('NAME')}")
        self.stdout.write(f" Target Host     : {active_db.get('HOST') or 'localhost'}:{active_db.get('PORT') or '3306'}")
        self.stdout.write(f" DEBUG Mode      : {settings.DEBUG}")

        with transaction.atomic():
            self.stdout.write("\n[1/2] Seeding Roles...")
            roles_map = {}
            for role_data in DEFAULT_ROLES:
                role, created = Role.objects.update_or_create(
                    name=role_data["name"],
                    defaults={
                        "description": role_data["description"],
                        "is_superadmin": role_data["is_superadmin"],
                        "status": 1,
                    }
                )
                action = "Created" if created else "Updated"
                self.stdout.write(f"  - [{action}] {role.name} (is_superadmin: {role.is_superadmin})")
                roles_map[role.name] = role

            self.stdout.write(f"\n[2/2] Provisioning First User '{username}' as Super Admin...")
            super_admin_role = roles_map["Super Admin"]

            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": email,
                    "first_name": first_name,
                    "last_name": last_name,
                    "role": super_admin_role,
                    "is_staff": True,
                    "is_superuser": True,
                    "status": 1,
                }
            )

            # Store SHA-256 pre-hashed password so UI, API, and Admin all authenticate flawlessly
            sha256_hex = hashlib.sha256(password.encode('utf-8')).hexdigest()
            user.set_password(sha256_hex)
            user.role = super_admin_role
            user.is_staff = True
            user.is_superuser = True
            user.status = 1
            user.email = email
            user.first_name = first_name
            user.last_name = last_name
            user.save()

            token, _ = Token.objects.get_or_create(user=user)

        self.stdout.write(self.style.SUCCESS("\n" + "=" * 60))
        self.stdout.write(self.style.SUCCESS(" SUCCESS: Initial setup completed successfully!"))
        self.stdout.write(self.style.SUCCESS("=" * 60))
        self.stdout.write(f"  Username   : {username}")
        self.stdout.write(f"  Password   : {password}")
        self.stdout.write(f"  Email      : {email}")
        self.stdout.write(f"  Role       : {user.role.name} (Super Admin: {user.role.is_superadmin})")
        self.stdout.write(f"  Auth Token : {token.key}")
        self.stdout.write(self.style.SUCCESS("=" * 60 + "\n"))
