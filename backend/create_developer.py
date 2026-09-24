#!/usr/bin/env python
"""
Database Initialization & First User Provisioning Script
Creates default roles and initializes the primary 'developer' user as Super Admin.

Usage:
    python create_developer.py
    python create_developer.py --username developer --password "Developer@123" --email developer@axinix.com
"""

import os
import sys
import argparse
import hashlib
from pathlib import Path

# Setup Django Environment
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

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


def seed_roles():
    """Create or update core roles."""
    roles_map = {}
    print("\n[1/2] Seeding Roles...")
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
        print(f"  - [{action}] {role.name} (is_superadmin: {role.is_superadmin})")
        roles_map[role.name] = role
    return roles_map


def provision_developer_user(username, password, email, first_name, last_name, roles_map):
    """Create or update developer user as Super Admin."""
    print(f"\n[2/2] Provisioning First User '{username}' as Super Admin...")

    super_admin_role = roles_map.get("Super Admin")
    if not super_admin_role:
        super_admin_role = Role.objects.get(name="Super Admin")

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

    # Store SHA-256 pre-hashed password so both UI (pre-hashed) and Admin/API authenticate seamlessly
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

    # Generate or fetch DRF Auth Token
    token, _ = Token.objects.get_or_create(user=user)

    action = "Created new" if created else "Updated existing"
    print(f"  - [{action}] user '{user.username}' (ID: {user.id})")
    print(f"  - Role: {user.role.name} (is_superadmin: {user.role.is_superadmin})")
    print(f"  - Auth Token: {token.key}")

    return user, token


def main():
    parser = argparse.ArgumentParser(description="Provision roles and initial developer superadmin account.")
    parser.add_argument("--username", default="developer", help="Developer username (default: developer)")
    parser.add_argument("--password", default="Developer@123", help="Developer password (default: Developer@123)")
    parser.add_argument("--email", default="developer@axinix.com", help="Developer email (default: developer@axinix.com)")
    parser.add_argument("--first-name", default="System", help="First name (default: System)")
    parser.add_argument("--last-name", default="Developer", help="Last name (default: Developer)")
    args = parser.parse_args()

    active_db = settings.DATABASES['default']
    print("=" * 60)
    print(" AXINIX E-COMMERCE PLATFORM - INITIAL USER SETUP")
    print("=" * 60)
    print(f" Target Database : {active_db.get('NAME')}")
    print(f" Target Host     : {active_db.get('HOST') or 'localhost'}:{active_db.get('PORT') or '3306'}")
    print(f" Target User     : {active_db.get('USER')}")
    print(f" DEBUG Mode      : {settings.DEBUG}")
    print("=" * 60)

    try:
        with transaction.atomic():
            roles = seed_roles()
            user, token = provision_developer_user(
                username=args.username,
                password=args.password,
                email=args.email,
                first_name=args.first_name,
                last_name=args.last_name,
                roles_map=roles
            )

        print("\n" + "=" * 60)
        print(" SUCCESS: First user provisioned successfully!")
        print("=" * 60)
        print(f"  Username   : {args.username}")
        print(f"  Password   : {args.password}")
        print(f"  Email      : {args.email}")
        print(f"  Role       : {user.role.name} (Super Admin: {user.role.is_superadmin})")
        print(f"  Auth Token : {token.key}")
        print("=" * 60)
        print(" You can now log in via:")
        print("  1. React Frontend UI (http://localhost:5173/login)")
        print("  2. Django Admin       (http://localhost:8000/admin/)")
        print("  3. REST API Login     (POST /api/v1/users/login/)")
        print("=" * 60 + "\n")

    except Exception as e:
        print(f"\n[ERROR] Failed to provision initial user: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
