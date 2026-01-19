import { ContextBudget } from "../src/index.js";
import type { RebalanceStrategy } from "../src/plugins.js";

// A strategy that always compresses overflowing zones instead of borrowing.
const compressOnly: RebalanceStrategy = (zones, totalTokens) => ({
  actions: zones
    .filter((z) => z.remaining(totalTokens) < 0)
    .map((z) => ({ type: "compress" as const, zone: z.name, amount: -z.remaining(totalTokens) })),
  resolved: zones.every((z) => z.remaining(totalTokens) >= 0),
});

const budget = new ContextBudget(
  { totalTokens: 1000, zones: [{ name: "history", targetPercent: 0.5 }] },
  compressOnly
);
budget.recordUsage("history", 600);
console.log(budget.rebalance());
