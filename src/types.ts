export type TokenCounter = (text: string) => number;

export interface ZoneConfig {
  name: string;
  targetPercent?: number;
  hardCapTokens?: number;
  lendable?: boolean;
}

export interface BudgetConfig {
  totalTokens: number;
  zones: ZoneConfig[];
}
