# Access Policies: Database Model & Dynamic Resolution

## Overview
Per the Tracker-v2 architecture, security and permission policies are **not** static configuration files. Instead, they are managed via the **`AccessPolicies` Mongoose model** (`backend/src/models/AccessPolicies.js` registered in `Collection.js` as `access_policies`):

- **Model Fields**:
  - `role`: ObjectId reference to `roles` model.
  - `modelName`: Target model string (e.g., `users`, `roles`, `products`, `orders`).
  - `actions`: Array of permitted operations (`["read", "create", "update", "delete", "report"]`).
  - `allowAccess`: Map of actions to allowed fields (e.g. `{ read: ["*"], create: ["name", "email"] }`).
  - `forbiddenAccess`: Map of actions to explicitly denied fields.
  - `conditions`: Map of rule conditions or custom ABAC checks.
  - `registry`: Array of custom registry rule names.

- **Dynamic Evaluation**:
  - `policyEngine.js` resolves policies by querying `models.access_policies.findOne({ role, modelName })`.
  - Super Admin role bypasses model restrictions with wildcard capabilities.
  - If a non-admin role queries a model without a defined `AccessPolicies` document, the request fails closed (`403 FORBIDDEN - POLICY_NOT_FOUND`).
