# Policy Engine: Lightweight Authorization & CRUD Resolution

## Architectural Role
The Policy Engine (`backend/src/utils/policy/policyEngine.js`) has two strict responsibilities:
1. **Authorize Request**:
   - If user has `ctx.user?.isSuperAdmin === true`, automatically bypass with full wildcard permissions:
     ```javascript
     {
       role: "Super Admin",
       modelName: targetModel,
       permissions: { read: true, create: true, update: true, delete: true, report: true },
       forbiddenAccess: { read: [], create: [], update: [], delete: [] },
       allowAccess: { read: ["*"], create: ["*"], update: ["*"], delete: ["*"] }
     }
     ```
   - For any other role, verify access policy from fast in-memory cache (`getPolicy(role, modelName)` from `utils/cache.js`).
   - If policy not found or action denied (`policy.permissions[action] === false`), immediately fail closed (`403 Forbidden`).
2. **Resolve CRUD Handler**:
   - Dynamically resolves and delegates to the matching handler: `crud/build${capitalize(action)}Query.js`.

## Non-Responsibilities
- Does **not** perform database lookups directly during query execution (cache is primed at server startup via `setCache()`).
- Does **not** execute DB mutations or queries.
- Does **not** inspect or format response payloads.
