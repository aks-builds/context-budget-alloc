import type { ZoneConfig } from "./types.js";
import { InvalidZoneConfigError } from "./errors.js";

export class Zone {
  readonly name: string;
  readonly lendable: boolean;
  readonly priority: number;
  private readonly targetPercent?: number;
  private readonly hardCapTokens?: number;
  private borrowedTokens = 0;
  private usedTokens = 0;

  constructor(config: ZoneConfig) {
    if (!config.name || !config.name.trim()) {
      throw new InvalidZoneConfigError("Zone name must be a non-empty string.");
    }
    if (config.targetPercent !== undefined && config.hardCapTokens !== undefined) {
      throw new InvalidZoneConfigError(
        `Zone "${config.name}" cannot set both targetPercent and hardCapTokens.`
      );
    }
    if (config.targetPercent === undefined && config.hardCapTokens === undefined) {
      throw new InvalidZoneConfigError(
        `Zone "${config.name}" must set targetPercent or hardCapTokens.`
      );
    }
    this.name = config.name.trim();
    this.targetPercent = config.targetPercent;
    this.hardCapTokens = config.hardCapTokens;
    this.lendable = config.lendable ?? true;
    this.priority = config.priority ?? 0;
  }

  /** Resolve this zone's cap in tokens given the current total window size. */
  capTokens(totalTokens: number): number {
    if (this.hardCapTokens !== undefined) return this.hardCapTokens;
    return Math.floor((this.targetPercent ?? 0) * totalTokens);
  }

  record(tokens: number): void {
    if (tokens < 0) {
      throw new InvalidZoneConfigError(`Cannot record negative usage for zone "${this.name}".`);
    }
    this.usedTokens += tokens;
  }

  /** Clear recorded usage and any borrowed/lent adjustments, e.g. for a new conversation turn. */
  reset(): void {
    this.usedTokens = 0;
    this.borrowedTokens = 0;
  }

  get used(): number {
    return this.usedTokens;
  }

  /** Adjust borrowed capacity. Positive = borrowed in, negative = lent out. */
  borrow(tokens: number): void {
    this.borrowedTokens += tokens;
  }

  get borrowed(): number {
    return this.borrowedTokens;
  }

  effectiveCap(totalTokens: number): number {
    return this.capTokens(totalTokens) + this.borrowedTokens;
  }

  remaining(totalTokens: number): number {
    return this.effectiveCap(totalTokens) - this.usedTokens;
  }

  utilization(totalTokens: number): number {
    const cap = this.effectiveCap(totalTokens);
    if (cap <= 0) return this.usedTokens > 0 ? Infinity : 0;
    return this.usedTokens / cap;
  }
}
