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
