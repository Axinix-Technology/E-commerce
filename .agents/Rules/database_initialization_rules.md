# Database Initialization & Seeding Rule

## Rule 1: Always Seed Data After Migrations or Database Resets
When initializing a fresh database, running migrations from scratch, or switching to a new local SQLite database, you MUST immediately populate it by running the following sequence of commands in the `backend/` directory:

1. `python manage.py migrate` (To create tables)
2. `python create_developer.py` (To create the initial developer superadmin account)
3. `python manage.py seed_navigation` (To populate the sidebar navigation, UI capabilities, and module links)
4. `python manage.py seed_states` (To populate statutory GST states)
5. `python manage.py seed_storefront` (To populate demo catalogue, categories, policies, and homepage data)

## Rule 2: UI Blank State Prevention
If the frontend UI loads successfully but sidebar pages, menus, or essential dropdowns are empty or not shown, you must assume the core reference data (navigation capabilities or states) is missing from the database and immediately run the `seed_navigation` and other relevant seed scripts.
