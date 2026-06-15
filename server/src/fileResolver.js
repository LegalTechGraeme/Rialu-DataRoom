import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { resolveSimulationFile } from "./simulationLoader.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const MATTERS_FILES_ROOT = path.resolve(__dirname, "../../data/matters");

const SIMULATION_MATTER_ID = "matter-acme";

/**
 * @param {string} matterId
 * @param {string} storagePath
 */
export function resolveDocumentFile(matterId, storagePath) {
  if (matterId === SIMULATION_MATTER_ID) {
    return resolveSimulationFile(storagePath);
  }
  const filesRoot = path.join(MATTERS_FILES_ROOT, matterId, "files");
  const abs = path.join(filesRoot, storagePath);
  const normalized = path.normalize(abs);
  if (!normalized.startsWith(filesRoot)) {
    throw new Error("Invalid storage path");
  }
  if (!fs.existsSync(normalized)) {
    throw new Error("File not found");
  }
  return normalized;
}
