import { getService as registryGetService } from "./appRegistry.js";

export function getService(modelName) {
  return registryGetService(modelName);
}

export default {
  getService
};
