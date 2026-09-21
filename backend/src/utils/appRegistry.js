import models from "../models/Collection.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const registry = {
  models: {},
  services: {}
};

/**
 * Retrieve model by name from central Collection registry.
 */
export function getModel(name) {
  if (!name) return null;

  const raw = String(name).trim();
  const lower = raw.toLowerCase();
  const clean = lower.replace(/[^a-z0-9]/g, "");

  const found =
    models[raw] ||
    models[lower] ||
    models[clean] ||
    registry.models[raw] ||
    registry.models[lower] ||
    registry.models[clean];

  if (found) return found;

  throw new Error(`[appRegistry] Model "${name}" is not registered in Collection registry`);
}

/**
 * Retrieve service file path if exists.
 */
export function getService(name) {
  if (!name) return null;
  const lower = String(name).toLowerCase().trim();

  const servicesDir = path.resolve(__dirname, "../services");
  const servicePath = path.join(servicesDir, `${lower}.js`);

  if (fs.existsSync(servicePath)) {
    return servicePath;
  }

  return null;
}

export default {
  getModel,
  getService
};
