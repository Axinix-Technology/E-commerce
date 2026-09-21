# Centralized Single-Source Versioning System

## 1. Architectural Philosophy
The Central E-commerce Platform adheres to a **Single Source of Truth** versioning architecture mirroring `tracker-v2`. Rather than maintaining disjointed versions across different sub-projects, all versions are mastered in a single root JSON file:
`e:\Loigmax\E-commerce\version.json`

Sub-projects and deployment gates never diverge from the root version:
- **Backend API**: Dynamically loads `version.json` on startup / per request at `GET /api/version`.
- **Frontend App**: Serves `public/version.json` and syncs `package.json`.
- **Root Workspace**: Manages automated synchronization and semver bumps via `scripts/version-tool.mjs`.
- **CI / CD Deployments**: Verifies semver strictly ascends prior to deployment via `scripts/verify-deploy-version.mjs`.

---

## 2. Root Version Schema (`version.json`)
```json
{
  "name": "central-ecommerce-platform",
  "version": "1.0.0",
  "description": "Centralized E-commerce Platform",
  "updatedAt": "2026-09-21T10:55:00.000Z",
  "minSupportedClientVersion": "1.0.0",
  "forceDeploy": false
}
```

---

## 3. Version Tooling Commands
Run from the root directory:

| Command | Action | Affected Targets |
| :--- | :--- | :--- |
| `npm run version:get` | Prints current system version | `version.json` |
| `npm run version:sync` | Propagates version across all targets | `package.json`, `backend/package.json`, `frontend/package.json`, `frontend/public/version.json`, `releaseNotes.json` |
| `npm run version:bump:patch` | Increments patch (`1.0.0` -> `1.0.1`) | Root `version.json` + triggers `version:sync` |
| `npm run version:bump:minor` | Increments minor (`1.0.0` -> `1.1.0`) | Root `version.json` + triggers `version:sync` |
| `npm run version:bump:major` | Increments major (`1.0.0` -> `2.0.0`) | Root `version.json` + triggers `version:sync` |
| `npm run verify:backend` | Validates local version > live endpoint | Pre-deploy gate for Render / Backend |
| `npm run verify:frontend` | Validates local version > live endpoint | Pre-deploy gate for Vercel / Frontend |

---

## 4. Subsystem Integrations

### 4.1 Backend Endpoint (`GET /api/version`)
In `backend/src/index.js`, the route resolves the version dynamically:
```javascript
const rootVersionPath = path.resolve(process.cwd(), "../version.json");
const localVersionPath = path.resolve(process.cwd(), "package.json");
if (fs.existsSync(rootVersionPath)) {
  version = JSON.parse(fs.readFileSync(rootVersionPath, "utf8")).version || version;
} else if (fs.existsSync(localVersionPath)) {
  version = JSON.parse(fs.readFileSync(localVersionPath, "utf8")).version || version;
}
```

### 4.2 Frontend Public Version (`frontend/public/version.json`)
Vite serves this static asset directly from the web root (`/version.json`). The client sidebar and diagnostic monitoring read this endpoint to display the live version and check for client update alerts.

### 4.3 Automated Release Notes Registry
Synchronizing updates `backend/src/constants/releaseNotes.json` automatically, appending entries and maintaining the `isLatest` release flag for audit trails.
