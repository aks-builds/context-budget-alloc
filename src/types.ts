export type TokenCounter = (text: string) => number;

export interface ZoneConfig {
  name: string;
  targetPercent?: number;
  hardCapTokens?: number;
}

export interface BudgetConfig {
  totalTokens: number;
  zones: ZoneConfig[];
}
