import type { Zone } from "./zone.js";

export interface RebalanceAction {
  type: "compress";
  zone: string;
  amount: number;
}

export interface RebalanceResult {
  actions: RebalanceAction[];
  resolved: boolean;
}

/** Detects zones that are over their cap. Borrowing comes in a later change. */
export function rebalance(zones: Zone[], totalTokens: number): RebalanceResult {
  const actions: RebalanceAction[] = [];
  for (const zone of zones) {
    const remaining = zone.capTokens(totalTokens) - zone.used;
    if (remaining < 0) {
      actions.push({ type: "compress", zone: zone.name, amount: -remaining });
    }
  }
  return { actions, resolved: actions.length === 0 };
}
