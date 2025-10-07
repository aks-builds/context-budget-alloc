import { readFileSync } from "node:fs";
import type { BudgetConfig } from "./types.js";

export function parseBudgetConfig(raw: unknown): BudgetConfig {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Config must be a JSON object.");
  }
  const obj = raw as Record<string, unknown>;
  if (typeof obj.totalTokens !== "number" || obj.totalTokens <= 0) {
    throw new Error("Config must set a positive numeric totalTokens.");
  }
  if (!Array.isArray(obj.zones) || obj.zones.length === 0) {
    throw new Error("Config must define at least one zone in `zones`.");
  }
  for (const zone of obj.zones) {
    if (typeof zone !== "object" || zone === null || typeof (zone as any).name !== "string") {
      throw new Error("Every zone needs a string `name`.");
    }
  }
  return obj as unknown as BudgetConfig;
}

export function loadBudgetConfigFile(path: string): BudgetConfig {
  return parseBudgetConfig(JSON.parse(readFileSync(path, "utf8")));
}
