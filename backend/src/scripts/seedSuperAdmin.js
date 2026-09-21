import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../Config/ConnectDB.js";
import models from "../models/Collection.js";

dotenv.config();

const User = models.users;
const Role = models.roles;
const AccessPolicies = models.access_policies;

const DEFAULT_ROLES = [
  {
    name: "Super Admin",
    description: "Full unconstrained administrative authority across the entire platform",
    permissions: ["*"],
    isSystem: true
  },
  {
    name: "Catalogue Manager",
    description: "Management of products, variants, categories, barcodes, and channels",
    permissions: ["catalogue:read", "catalogue:write", "catalogue:delete"],
    isSystem: true
  },
  {
    name: "Inventory Manager",
    description: "Stock ledger, inward operations, adjustments, and reservations",
    permissions: ["inventory:read", "inventory:write", "inward:read", "inward:write"],
    isSystem: true
  },
  {
    name: "Order Manager",
    description: "Multi-channel orders, status updates, cancellations, and fulfillment",
    permissions: ["orders:read", "orders:write"],
    isSystem: true
  },
  {
    name: "Operations User",
    description: "Operational floor tasks, barcode scanning, packing, and dispatch",
    permissions: ["operations:read", "operations:write"],
    isSystem: true
  },
  {
    name: "Viewer/Reporting User",
    description: "Read-only access to dashboards, reports, and analytics",
    permissions: ["reports:read"],
    isSystem: true
  }
];

async function seedSuperAdmin() {
  try {
    await connectDB();
    console.log("🌱 Seeding Roles, Access Policies & Super Admin...");

    // 1. Seed Roles
    const roleDocs = {};
    for (const roleData of DEFAULT_ROLES) {
      const doc = await Role.findOneAndUpdate(
        { name: roleData.name },
        { $set: roleData },
        { upsert: true, new: true }
      );
      roleDocs[roleData.name] = doc;
    }
    console.log("✅ Default Roles verified / created");

    // 2. Seed AccessPolicies database model
    // Super Admin has automatic wildcard bypass, but we also create policy records for other roles
    const modelsList = [
      "users",
      "roles",
      "sessions",
      "access_policies",
      "backups",
      "backup_configs",
      "general_settings"
    ];
    for (const [rName, rDoc] of Object.entries(roleDocs)) {
      for (const mName of modelsList) {
        const isSuperAdmin = rName === "Super Admin";
        const isViewer = rName === "Viewer/Reporting User";

        const actions = isSuperAdmin
          ? ["read", "create", "update", "delete", "report"]
          : isViewer
          ? ["read", "report"]
          : ["read", "create", "update", "report"];

        await AccessPolicies.findOneAndUpdate(
          { role: rDoc._id, modelName: mName },
          {
            $set: {
              role: rDoc._id,
              modelName: mName,
              actions,
              allowAccess: {
                read: ["*"],
                create: ["*"],
                update: ["*"],
                delete: isSuperAdmin ? ["*"] : []
              },
              forbiddenAccess: {
                read: [],
                create: [],
                update: [],
                delete: []
              }
            }
          },
          { upsert: true, new: true }
        );
      }
    }
    console.log("✅ AccessPolicies model records verified / created in database");

    // 3. Seed Default General Settings
    const GeneralSettings = models.general_settings;
    if (GeneralSettings) {
      await GeneralSettings.findOneAndUpdate(
        { key: "general" },
        {
          $setOnInsert: {
            key: "general",
            platformName: "Central E-commerce & Marketplace Platform",
            storeName: "Central Store",
            tagline: "Unified Multi-Channel Retail & Inventory Management",
            siteUrl: "http://localhost:3000",
            supportEmail: "support@ecommerce.local",
            supportPhone: "+1-800-555-0199",
            currency: {
              code: "USD",
              symbol: "$",
              position: "prefix",
              decimalPlaces: 2
            },
            localization: {
              timezone: "UTC",
              dateFormat: "YYYY-MM-DD",
              timeFormat: "HH:mm:ss",
              defaultLanguage: "en"
            },
            inventorySettings: {
              lowStockThreshold: 10,
              outOfStockThreshold: 0,
              enableBackorders: false,
              autoReserveStockOnOrder: true,
              trackInventoryByBatch: false
            },
            orderSettings: {
              orderPrefix: "ORD-",
              invoicePrefix: "INV-",
              autoCancelUnpaidMinutes: 60,
              enableGuestCheckout: true
            },
            securitySettings: {
              sessionTimeoutMinutes: 1440,
              maxLoginAttempts: 5,
              lockoutDurationMinutes: 15,
              requireMFA: false
            },
            maintenanceMode: {
              enabled: false,
              message: "The system is currently undergoing scheduled maintenance. Please check back shortly."
            },
            notificationSettings: {
              emailNotifications: true,
              smsNotifications: false,
              whatsappNotifications: false
            }
          }
        },
        { upsert: true, new: true }
      );
      console.log("✅ Default General Settings verified / created in database");
    }

    // 4. Seed Default Backup Configuration
    const BackupConfig = models.backup_configs;
    if (BackupConfig) {
      await BackupConfig.findOneAndUpdate(
        { name: "Daily Automated Backup" },
        {
          $setOnInsert: {
            name: "Daily Automated Backup",
            description: "Automated daily full database backup with gzip compression",
            cronExpression: "0 2 * * *", // 2:00 AM daily
            timezone: "UTC",
            enabled: true,
            retentionDays: 14,
            compression: "gzip",
            targetCollections: ["*"],
            lastStatus: "IDLE"
          }
        },
        { upsert: true, new: true }
      );
      console.log("✅ Default Backup Configuration verified / created in database");
    }

    // 5. Seed Super Admin
    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminEmail = process.env.ADMIN_EMAIL || "admin@ecommerce.local";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";

    let admin = await User.findOne({
      $or: [{ username: adminUsername }, { email: adminEmail }]
    }).select("+password");

    if (!admin) {
      admin = new User({
        name: "Platform Super Admin",
        username: adminUsername,
        email: adminEmail,
        password: adminPassword,
        role: "Super Admin",
        isSuperAdmin: true,
        status: "Active"
      });
      await admin.save();
      console.log(`✅ Super Admin created: ${adminUsername} (${adminEmail}) / ${adminPassword}`);
    } else {
      admin.name = "Platform Super Admin";
      admin.username = adminUsername;
      admin.email = adminEmail;
      admin.role = "Super Admin";
      admin.isSuperAdmin = true;
      admin.status = "Active";
      admin.password = adminPassword; // Triggers pre-save bcrypt hash
      await admin.save();
      console.log(`✅ Super Admin credentials & status updated: ${adminUsername} (${adminEmail})`);
    }

    console.log("🎉 Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding Error:", err);
    process.exit(1);
  }
}

seedSuperAdmin();
