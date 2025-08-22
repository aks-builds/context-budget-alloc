import type { ZoneConfig } from "./types.js";

export class Zone {
  readonly name: string;
  private readonly targetPercent?: number;
  private readonly hardCapTokens?: number;
  private usedTokens = 0;

  constructor(config: ZoneConfig) {
    if (!config.name || !config.name.trim()) {
      throw new Error("Zone name must be a non-empty string.");
    }
    if (config.targetPercent !== undefined && config.hardCapTokens !== undefined) {
      throw new Error(`Zone "${config.name}" cannot set both targetPercent and hardCapTokens.`);
    }
    if (config.targetPercent === undefined && config.hardCapTokens === undefined) {
      throw new Error(`Zone "${config.name}" must set targetPercent or hardCapTokens.`);
    }
    this.name = config.name;
    this.targetPercent = config.targetPercent;
    this.hardCapTokens = config.hardCapTokens;
  }

  // Floor (not round) percent-based caps: rounding up could push a set of
  // zones' caps past totalTokens when several zones round up at once.
  capTokens(totalTokens: number): number {
    if (this.hardCapTokens !== undefined) return this.hardCapTokens;
    return Math.floor((this.targetPercent ?? 0) * totalTokens);
  }

  record(tokens: number): void {
    this.usedTokens += tokens;
  }

  get used(): number {
    return this.usedTokens;
  }
}
