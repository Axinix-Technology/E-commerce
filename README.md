<div align="center">

```
   █████╗ ██╗   ██╗██╗███╗   ██╗██╗██╗  ██╗
  ██╔══██╗╚██╗ ██╔╝██║████╗  ██║██║╚██╗██╔╝
  ███████║ ╚████╔╝ ██║██╔██╗ ██║██║ ╚███╔╝ 
  ██╔══██║ ██╔═██╗ ██║██║╚██╗██║██║ ██╔██╗ 
  ██║  ██║██╔╝ ██╗ ██║██║ ╚████║██║██╔╝ ██╗
  ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝
   T   E   C   H   N   O   L   O   G   I   E   S
```

# ⚡ Axinix E-Commerce - Omnichannel Inventory & Billing Platform
### *An Axinix Technologies Product • "Build Next Gen Today"*

---

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=for-the-badge&logo=semver&logoColor=white)](./version.json)
[![Python](https://img.shields.io/badge/python-%3E%3D3.12-3776AB.svg?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![Django](https://img.shields.io/badge/django-6.1+-092E20.svg?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/DRF-REST_Framework-red.svg?style=for-the-badge)](https://www.django-rest-framework.org/)
[![MySQL](https://img.shields.io/badge/database-mysql_8.0+-4479A1.svg?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![React](https://img.shields.io/badge/react-19.0.0-61dafb.svg?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/vite-6.2.0-646cff.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/tailwind-v4.0-38bdf8.svg?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

<br />

[Architecture Overview](#-system-architecture) • [Quick Start Setup](#-developer-guide) • [Environment Config](#-environment-configuration) • [API & Auth](#-authentication--security) • [Default Credentials](#-default-credentials)

---

</div>

<br />

## 🌟 Executive Summary

The **Axinix Centralized E-Commerce Platform** is an enterprise solution engineered by **Axinix Technologies** under our foundational motto: *"Engineering Tommrow!."*.

Engineered to streamline operations for manufacturers, brands, and multi-channel retailers:
- **Cloud POS & Retail Billing**: Fast counter billing, barcoding, and automated multi-tax invoice computation.
- **Centralized Catalog & Inventory**: Unified SKU tracking, inward batches, and safety stock threshold alerts.
- **Omnichannel Stock & Order Ledger**: Connects physical stores and online channels to fulfill orders and prevent overselling.
- **Dual-Mode Database Architecture**: Automatically routes to local MySQL when in debug/development mode, or securely toggles to SSL-encrypted cloud databases (Aiven MySQL) in production.
- **Role-Based User Architecture (RBAC)**: Flexible roles (`Super Admin`, `Store Manager`, `Staff`, `Customer`) with fine-grained foreign key mapping on custom user models.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Frontend ["🖥️ Frontend Interface (React 19 + Vite 6)"]
        UI["Admin Console & Dashboard"]
        ROUTER["File-Based Router (~react-pages)"]
        AXIOS["Axios Interceptor (Auth Token Injection)"]
        PROXY["Vite Dev Reverse-Proxy (/api -> 8000)"]
    end

    subgraph Backend ["⚙️ Core Backend (Django 6.1 + DRF)"]
        AUTH_BACKEND["DualPasswordBackend (SHA-256 + Raw)"]
        AUTH_TOKEN["DRF Token Authentication"]
        ROLES_ENGINE["RBAC Roles Master (Role FK)"]
        
        subgraph Apps ["Domain Apps"]
            USERS["users (Auth, Profiles, Sessions, Notifications)"]
            COMPANY["company (Company Master & Multi-Tenant Branding)"]
            CATALOGUE["catalogue (Categories, Products, Variants)"]
            INVENTORY["inventory (Stock & Warehouses)"]
            INWARD["inward (Inward Batches & POs)"]
            ORDERS["orders (POS & E-Commerce Orders)"]
            CHANNELS["channels (Marketplace Sync)"]
        end
    end

    subgraph Database ["🗄️ Database Layer (MySQL)"]
        LOCAL_DB[("Local MySQL (DEBUG=True)")]
        LIVE_DB[("Live Aiven MySQL SSL (DEBUG=False)")]
    end

    UI --> ROUTER --> AXIOS --> PROXY
    PROXY -->|HTTP /api/v1/*| AUTH_BACKEND
    AUTH_BACKEND --> AUTH_TOKEN --> ROLES_ENGINE
    ROLES_ENGINE --> Apps

    Apps -->|DEBUG=True| LOCAL_DB
    Apps -->|DEBUG=False| LIVE_DB
```

---

## 📦 Directory Structure

```text
E-commerce/
├── 📄 version.json                    # Single source of truth project version
├── 📄 package.json                   # Root workspace management
├── 📄 README.md                      # Platform documentation
├── 📁 backend/                       # 🐍 Django 6.1 REST API Service
│   ├── 📄 manage.py                  # Django CLI entrypoint
│   ├── 📄 requirements.txt           # Python backend dependencies
│   ├── 📄 .env.example               # Backend environment template
│   ├── 📄 create_developer.py        # First-user & roles provisioning script
│   ├── 📁 config/                    # Core project configurations
│   │   ├── settings.py               # Auto DB switching (Local vs Live Cloud)
│   │   ├── urls.py                   # Root URL routing
│   │   └── wsgi.py
│   ├── 📁 users/                     # User management & RBAC Roles
│   │   ├── models.py                 # Role & custom User models
│   │   ├── backends.py               # DualPasswordBackend (SHA-256 prehash support)
│   │   ├── views.py                  # Login, Profile & Me endpoints
│   │   └── management/commands/      # python manage.py setup_initial_db
│   ├── 📁 company/                   # Dynamic company master & branding
│   ├── 📁 catalogue/                 # Product catalogs & variants
│   ├── 📁 inventory/                 # Stock tracking
│   ├── 📁 inward/                    # Inward processing
│   ├── 📁 orders/                    # Orders & fulfillment
│   ├── 📁 channels/                  # Omnichannel marketplaces
│   └── 📁 storefront/                # Storefront services
├── 📁 frontend/                      # 🎨 React 19 + Vite 6 Admin Console
│   ├── 📄 package.json               # Node dependencies
│   ├── 📄 vite.config.js             # Vite config & API reverse-proxy
│   ├── 📄 .env.example               # Frontend environment template
│   ├── 📁 src/
│   │   ├── api/                      # Axios client & token interceptors
│   │   ├── components/               # TopNavBar, Sidebar, UI widgets
│   │   ├── context/                  # AuthProvider, ThemeProvider
│   │   ├── layouts/                  # Responsive BaseLayout
│   │   └── pages/                    # Dynamic file-routed pages
│   └── 📁 public/                    # Static assets & public version
```

---

## 🛠️ Developer Guide

### 1. Prerequisites
- **Python**: `3.12+`
- **Node.js**: `v18.0.0+`
- **MySQL Server**: `8.0+` (local instance or cloud database)
- **Git**

---

### 2. Backend Setup (Django + DRF)

1. **Navigate to the backend directory and activate virtual environment**:
   ```bash
   cd backend
   python -m venv myvenv

   # On Windows (PowerShell):
   .\myvenv\Scripts\Activate.ps1
   # On Windows (Command Prompt):
   .\myvenv\Scripts\activate.bat
   # On macOS / Linux:
   source myvenv/bin/activate
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**:
   Copy the example environment file:
   ```bash
   cp .env.example .env
   # or copy .env-example .env
   ```
   Edit `.env` with your MySQL credentials:
   ```ini
   MYSQL_HOST=127.0.0.1
   MYSQL_PORT=3306
   MYSQL_USER=root
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=axinix_ecommerce_db

   # Live cloud connection (active automatically when DEBUG=False)
   MYSQL_DATABASE_LIVE=mysql://avnadmin:pass@host:10654/defaultdb?ssl-mode=REQUIRED

   DEBUG=True
   SECRET_KEY=django-insecure-your-secret-key
   ALLOWED_HOSTS=*
   ```

4. **Run Database Migrations**:
   ```bash
   python manage.py migrate
   ```

5. **Seed Default Roles & Create Developer User**:
   Run either the standalone script or Django command:
   ```bash
   # Option A: Standalone setup script
   python create_developer.py

   # Option B: Django management command
   python manage.py setup_initial_db
   ```

6. **Start the Django Development Server**:
   ```bash
   python manage.py runserver
   ```
   > Server runs at `http://127.0.0.1:8000` (API root: `http://127.0.0.1:8000/api/v1/`).

---

### 3. Frontend Setup (React 19 + Vite 6)

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Configure Frontend Environment**:
   ```bash
   cp .env.example .env
   # or copy .env-example .env
   ```

4. **Launch Vite Development Server**:
   ```bash
   npm run dev
   ```
   > The web app opens at `http://localhost:5173`.
   >
   > *Vite automatically reverse-proxies `/api` and `/media` requests to `http://127.0.0.1:8000`.*

---

## 🔐 Authentication & Security

1. **Pre-Hashed SHA-256 Transport**:
   * The client never sends raw passwords across the wire.
   * `login.jsx` uses browser-native `crypto.subtle.digest("SHA-256")` before sending credentials.
2. **DualPasswordBackend**:
   * Enables seamless authentication whether logging in from the **React UI** (pre-hashed SHA-256) or **Django Admin / API testing tools** (raw password).
3. **Token Authentication**:
   * DRF Token headers (`Authorization: Token <key>`) authenticate subsequent requests.
4. **Session Tracking**:
   * User login devices, IPs, and optional FCM push notification tokens are recorded in `UserSession`.

---

## 🔑 Default Credentials

When `python manage.py setup_initial_db` or `python create_developer.py` is executed, the following administrator is created:

| Field | Value | Notes |
| :--- | :--- | :--- |
| **Username** | `developer` | Super Administrator |
| **Password** | `Developer@123` | Works in UI, Django Admin, and REST API |
| **Role** | `Super Admin` | `is_superadmin: True` |
| **Email** | `developer@axinix.com` | Primary account |

### Default System Roles:
- **Super Admin**: `is_superadmin: True` — Full platform administrative authority.
- **Store Manager**: `is_superadmin: False` — Catalog, inventory, and order fulfillment.
- **Staff**: `is_superadmin: False` — Warehouse and retail operations.
- **Customer**: `is_superadmin: False` — Storefront purchasing.

---

## 📡 Essential API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/users/login/` | Authenticate user & obtain Token | ❌ |
| `GET` | `/api/v1/users/me/` | Current user profile, role, & status | ✅ |
| `GET` | `/api/v1/company/public/` | Public store/company profile branding | ❌ |
| `GET` | `/admin/` | Built-in Django Administrative Portal | ✅ |

---

## 🔄 Version Management CLI

```bash
# Display active platform version
npm run version:get

# Propagate version across root and frontend
npm run version:sync

# Increment versions (updates version.json + auto-syncs targets)
npm run version:bump:patch    # 1.0.0 -> 1.0.1
npm run version:bump:minor    # 1.0.0 -> 1.1.0
npm run version:bump:major    # 1.0.0 -> 2.0.0
```

---

<div align="center">

<sub>Built with precision and care by <b>Axinix Technologies</b>.</sub><br />
<b>"Build Next Gen Today"</b><br />
<sub>Founding Leadership: Arunbharathi (Founder) • Ajay • Boopalan • Siva • Guru • Karuppasamy</sub><br />
<sup>Confidential & Proprietary • 2026</sup>

</div>
