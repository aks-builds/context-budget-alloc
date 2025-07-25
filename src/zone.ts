import type { ZoneConfig } from "./types.js";

export class Zone {
  readonly name: string;
  private readonly targetPercent: number;
  private usedTokens = 0;

  constructor(config: ZoneConfig) {
    if (!config.name || !config.name.trim()) {
      throw new Error("Zone name must be a non-empty string.");
    }
    if (config.targetPercent === undefined) {
      throw new Error(`Zone "${config.name}" must set targetPercent.`);
    }
    this.name = config.name;
    this.targetPercent = config.targetPercent;
  }

  capTokens(totalTokens: number): number {
    return Math.round(this.targetPercent * totalTokens);
  }

  record(tokens: number): void {
    this.usedTokens += tokens;
  }

  get used(): number {
    return this.usedTokens;
  }
}
