export type TokenCounter = (text: string) => number;

export interface ZoneConfig {
  name: string;
  targetPercent?: number;
  hardCapTokens?: number;
  priority?: number;
  lendable?: boolean;
}

export interface BudgetConfig {
  totalTokens: number;
  zones: ZoneConfig[];
}

export interface ZoneSnapshot {
  name: string;
  capTokens: number;
  usedTokens: number;
  remainingTokens: number;
  utilization: number;
  priority: number;
  lendable: boolean;
}

export interface BudgetSnapshot {
  totalTokens: number;
  zones: ZoneSnapshot[];
  overallUtilization: number;
}

export type RebalanceActionType = "borrow" | "compress";

export interface RebalanceAction {
  type: RebalanceActionType;
  zone: string;
  amount: number;
  from?: string;
}

export interface RebalanceResult {
  actions: RebalanceAction[];
  resolved: boolean;
}
