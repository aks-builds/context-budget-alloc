import type { RebalanceAction, RebalanceResult } from "./types.js";
import type { Zone } from "./zone.js";

/**
 * Attempts to resolve zones that are over their cap by borrowing spare
 * capacity from underused, lendable zones. Zones with higher priority
 * borrow first; among lenders, lower-priority zones lend first.
 */
export function rebalance(zones: Zone[], totalTokens: number): RebalanceResult {
  const actions: RebalanceAction[] = [];
  let resolved = true;

  const overflowing = zones
    .filter((zone) => zone.remaining(totalTokens) < 0)
    .sort((a, b) => b.priority - a.priority);

  for (const zone of overflowing) {
    let deficit = -zone.remaining(totalTokens);

    const lenders = zones
      .filter((z) => z !== zone && z.lendable && z.remaining(totalTokens) > 0)
      .sort((a, b) => a.priority - b.priority);

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
