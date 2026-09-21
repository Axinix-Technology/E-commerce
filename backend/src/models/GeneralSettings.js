import mongoose from "mongoose";

/**
 * GeneralSettings Model (Tracker-v2 Architecture)
 * STRICT SCHEMA DEFINITION ONLY.
 * Stored in MongoDB collection: "general_settings"
 * 
 * Stores global platform configurations, store metadata, currency/tax options,
 * inventory rules, and maintenance settings for direct control via the Admin UI.
 */
const generalSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: "general"
    },
    platformName: {
      type: String,
      default: "Central E-commerce & Marketplace Platform",
      trim: true
    },
    storeName: {
      type: String,
      default: "Central Store",
      trim: true
    },
    tagline: {
      type: String,
      default: "Unified Multi-Channel Retail & Inventory Management",
      trim: true
    },
    supportEmail: {
      type: String,
      default: "support@ecommerce.local",
      trim: true
    },
    supportPhone: {
      type: String,
      default: "+1-800-555-0199",
      trim: true
    },
    logoUrl: {
      type: String,
      default: "/assets/logo.png",
      trim: true
    },
    faviconUrl: {
      type: String,
      default: "/favicon.ico",
      trim: true
    },
    currency: {
      code: { type: String, default: "USD", uppercase: true },
      symbol: { type: String, default: "$" },
      position: { type: String, enum: ["prefix", "suffix"], default: "prefix" },
      decimalPlaces: { type: Number, default: 2 }
    },
    localization: {
      timezone: { type: String, default: "UTC" },
      dateFormat: { type: String, default: "YYYY-MM-DD" },
      timeFormat: { type: String, default: "HH:mm:ss" },
      defaultLanguage: { type: String, default: "en" }
    },
    inventorySettings: {
      lowStockThreshold: { type: Number, default: 10 },
      outOfStockThreshold: { type: Number, default: 0 },
      enableBackorders: { type: Boolean, default: false },
      autoReserveStockOnOrder: { type: Boolean, default: true },
      trackInventoryByBatch: { type: Boolean, default: false }
    },
    orderSettings: {
      orderPrefix: { type: String, default: "ORD-" },
      invoicePrefix: { type: String, default: "INV-" },
      autoCancelUnpaidMinutes: { type: Number, default: 60 },
      enableGuestCheckout: { type: Boolean, default: true }
    },
    taxSettings: [{
      pricesIncludeTax: { type: Boolean, default: false },
      defaultTaxRate: { type: Number, default: 0 },
      taxCalculationAddress: {
        type: String,
        enum: ["shipping", "billing", "store"],
        default: "shipping"
      }
    }],
    securitySettings: {
      sessionTimeoutMinutes: { type: Number, default: 1440 }, // 24 hours
      maxLoginAttempts: { type: Number, default: 5 },
      lockoutDurationMinutes: { type: Number, default: 15 },
      requireMFA: { type: Boolean, default: false },
      allowedFileExtensions: {
        type: [String],
        default: ["jpg", "jpeg", "png", "webp", "pdf", "csv", "xlsx"]
      }
    },
    maintenanceMode: {
      enabled: { type: Boolean, default: false },
      message: {
        type: String,
        default: "The system is currently undergoing maintenance. Please check back soon."
      }
    },
    notificationSettings: {
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      whatsappNotifications: { type: Boolean, default: false }
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Indexes
generalSettingsSchema.index({ key: 1 }, { unique: true });

const GeneralSettings = mongoose.model("general_settings", generalSettingsSchema);

export default GeneralSettings;
