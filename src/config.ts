import { readFileSync } from "node:fs";
import type { BudgetConfig } from "./types.js";
import { InvalidZoneConfigError } from "./errors.js";

export function parseBudgetConfig(raw: unknown): BudgetConfig {
  if (typeof raw !== "object" || raw === null) {
    throw new InvalidZoneConfigError("Config must be a JSON object.");
  }
  const obj = raw as Record<string, unknown>;
  if (typeof obj.totalTokens !== "number" || obj.totalTokens <= 0) {
    throw new InvalidZoneConfigError("Config must set a positive numeric totalTokens.");
  }
  if (!Array.isArray(obj.zones) || obj.zones.length === 0) {
    throw new InvalidZoneConfigError("Config must define at least one zone in `zones`.");
  }
  for (const [index, zone] of obj.zones.entries()) {
    if (typeof zone !== "object" || zone === null) {
      throw new InvalidZoneConfigError(`Zone at index ${index} must be an object.`);
    }
    const z = zone as Record<string, unknown>;
    if (typeof z.name !== "string" || !z.name.trim()) {
      throw new InvalidZoneConfigError(`Zone at index ${index} needs a non-empty string \`name\`.`);
    }
    if (z.targetPercent !== undefined && typeof z.targetPercent !== "number") {
      throw new InvalidZoneConfigError(`Zone "${z.name}" has a non-numeric targetPercent.`);
    }
    if (z.hardCapTokens !== undefined && typeof z.hardCapTokens !== "number") {
      throw new InvalidZoneConfigError(`Zone "${z.name}" has a non-numeric hardCapTokens.`);
    }
    if (z.priority !== undefined && typeof z.priority !== "number") {
      throw new InvalidZoneConfigError(`Zone "${z.name}" has a non-numeric priority.`);
    }
    if (z.lendable !== undefined && typeof z.lendable !== "boolean") {
      throw new InvalidZoneConfigError(`Zone "${z.name}" has a non-boolean lendable.`);
    }
  }
  return obj as unknown as BudgetConfig;
}

export function loadBudgetConfigFile(path: string): BudgetConfig {
  return parseBudgetConfig(JSON.parse(readFileSync(path, "utf8")));
}
