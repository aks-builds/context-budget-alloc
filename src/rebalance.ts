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

  const remainingOf = (zone: Zone) => zone.capTokens(totalTokens) - zone.used;
  const spare = new Map(zones.map((z) => [z.name, remainingOf(z)]));

  for (const zone of zones) {
    let deficit = -(spare.get(zone.name) ?? 0);
    if (deficit <= 0) continue;

    for (const lender of zones) {
      if (lender === zone || deficit <= 0) continue;
      const lenderSpare = spare.get(lender.name) ?? 0;
      if (lenderSpare <= 0) continue;

      const amount = Math.min(lenderSpare, deficit);
      spare.set(lender.name, lenderSpare - amount);
      spare.set(zone.name, (spare.get(zone.name) ?? 0) + amount);
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
