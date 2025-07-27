import type { BudgetConfig, ZoneConfig } from "./types.js";
import { Zone } from "./zone.js";

export class ContextBudget {
  readonly totalTokens: number;
  private readonly zones = new Map<string, Zone>();

  constructor(config: BudgetConfig) {
    this.totalTokens = config.totalTokens;
    for (const zoneConfig of config.zones) {
      this.addZone(zoneConfig);
    }
  }

  addZone(config: ZoneConfig): void {
    if (this.zones.has(config.name)) {
      throw new Error(`Zone "${config.name}" already exists.`);
    }
    this.zones.set(config.name, new Zone(config));
  }

  private getZone(name: string): Zone {
    const zone = this.zones.get(name);
    if (!zone) throw new Error(`Zone "${name}" does not exist.`);
    return zone;
  }

  recordUsage(zoneName: string, tokens: number): void {
    this.getZone(zoneName).record(tokens);
  }

  remaining(zoneName: string): number {
    const zone = this.getZone(zoneName);
    return zone.capTokens(this.totalTokens) - zone.used;
  }
}
