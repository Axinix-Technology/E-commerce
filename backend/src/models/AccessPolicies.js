import mongoose from "mongoose";

const AccessPolicySchema = new mongoose.Schema(
  {
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "roles",
      required: true
    },
    modelName: {
      type: String,
      required: true,
      trim: true
    },
    // Allowed actions/permissions (e.g. ["read", "create", "update", "delete", "report"])
    actions: {
      type: [String],
      default: ["read"]
    },
    forbiddenAccess: {
      read: { type: [String], default: [] },
      create: { type: [String], default: [] },
      update: { type: [String], default: [] },
      delete: { type: [String], default: [] }
    },
    allowAccess: {
      read: { type: [String], default: ["*"] },
      create: { type: [String], default: ["*"] },
      update: { type: [String], default: ["*"] },
      delete: { type: [String], default: [] }
    },
    registry: {
      type: [String],
      default: []
    },
    conditions: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Optimized indexes for fast policy engine lookups
AccessPolicySchema.index({ role: 1, modelName: 1 }, { unique: true });
AccessPolicySchema.index({ modelName: 1 });
AccessPolicySchema.index({ role: 1 });

const AccessPolicies = mongoose.model("access_policies", AccessPolicySchema);
export default AccessPolicies;
