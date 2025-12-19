import type { BudgetConfig, BudgetSnapshot, RebalanceResult, TokenCounter, ZoneConfig } from "./types.js";
import { Zone } from "./zone.js";
import { rebalance as runRebalance } from "./rebalance.js";
import { defaultEstimator } from "./estimator.js";
import { DuplicateZoneError, InvalidZoneConfigError, UnknownZoneError } from "./errors.js";

export class ContextBudget {
  readonly totalTokens: number;
  private readonly zones = new Map<string, Zone>();
  private readonly counter: TokenCounter;

  constructor(config: BudgetConfig) {
    if (!Number.isFinite(config.totalTokens) || config.totalTokens <= 0) {
      throw new InvalidZoneConfigError("totalTokens must be a positive, finite number.");
    }
    this.totalTokens = config.totalTokens;
    this.counter = config.counter ?? defaultEstimator;
    for (const zoneConfig of config.zones) {
      this.addZone(zoneConfig);
    }
  }

  addZone(config: ZoneConfig): void {
    if (this.zones.has(config.name)) throw new DuplicateZoneError(config.name);
    this.zones.set(config.name, new Zone(config));
  }

  private getZone(name: string): Zone {
    const zone = this.zones.get(name);
    if (!zone) throw new UnknownZoneError(name);
    return zone;
  }

  recordUsage(zoneName: string, tokens: number): void {
    this.getZone(zoneName).record(tokens);
  }

  /** Estimate and record usage for a chunk of text using the configured counter. */
  recordText(zoneName: string, text: string): number {
    const tokens = this.counter(text);
    this.recordUsage(zoneName, tokens);
    return tokens;
  }

  remaining(zoneName: string): number {
    return this.getZone(zoneName).remaining(this.totalTokens);
  }

  utilization(zoneName: string): number {
    return this.getZone(zoneName).utilization(this.totalTokens);
  }

  overallUtilization(): number {
    let used = 0;
    for (const zone of this.zones.values()) used += zone.used;
    return this.totalTokens > 0 ? used / this.totalTokens : 0;
  }

  rebalance(): RebalanceResult {
    return runRebalance(Array.from(this.zones.values()), this.totalTokens);
  }

  snapshot(): BudgetSnapshot {
    return {
      totalTokens: this.totalTokens,
      zones: Array.from(this.zones.values()).map((z) => ({
        name: z.name,
        capTokens: z.effectiveCap(this.totalTokens),
        usedTokens: z.used,
        remainingTokens: z.remaining(this.totalTokens),
        utilization: z.utilization(this.totalTokens),
        priority: z.priority,
        lendable: z.lendable,
      })),
      overallUtilization: this.overallUtilization(),
    };
  }

  toJSON(): BudgetSnapshot {
    return this.snapshot();
  }
}
