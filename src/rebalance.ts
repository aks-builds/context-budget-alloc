import type { Zone } from "./zone.js";

export interface RebalanceAction {
  type: "borrow" | "compress";
  zone: string;
  amount: number;
  from?: string;
}

export interface RebalanceResult {
  actions: RebalanceAction[];
  resolved: boolean;
}

export function rebalance(zones: Zone[], totalTokens: number): RebalanceResult {
  const actions: RebalanceAction[] = [];
  let resolved = true;

  const overflowing = zones.filter((zone) => zone.remaining(totalTokens) < 0);

  for (const zone of overflowing) {
    let deficit = -zone.remaining(totalTokens);

    const lenders = zones.filter((z) => z !== zone && z.lendable && z.remaining(totalTokens) > 0);

    for (const lender of lenders) {
      if (deficit <= 0) break;
      const spareAmount = lender.remaining(totalTokens);
      const amount = Math.min(spareAmount, deficit);
      if (amount <= 0) continue;

      lender.borrow(-amount);
      zone.borrow(amount);
      deficit -= amount;
      actions.push({ type: "borrow", zone: zone.name, amount, from: lender.name });
    }

    if (deficit > 0) {
      resolved = false;
      actions.push({ type: "compress", zone: zone.name, amount: deficit });
    }
  }

  return { actions, resolved };
}
