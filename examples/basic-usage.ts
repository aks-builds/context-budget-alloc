import { ContextBudget } from "../src/index.js";

const budget = new ContextBudget({
  totalTokens: 128000,
  zones: [
    { name: "system", targetPercent: 0.05, priority: 3, lendable: false },
    { name: "tools", targetPercent: 0.15, priority: 2 },
    { name: "retrieval", targetPercent: 0.3, priority: 1 },
    { name: "history", targetPercent: 0.4, priority: 1 },
    { name: "buffer", targetPercent: 0.1, priority: 0 },
  ],
});

budget.recordText("system", "You are a helpful assistant.");
budget.recordUsage("retrieval", 42000);
budget.recordUsage("history", 60000);

const result = budget.rebalance();
console.log("rebalance:", JSON.stringify(result, null, 2));
console.log("snapshot:", JSON.stringify(budget.snapshot(), null, 2));

// Start a fresh turn with the same zone configuration.
budget.reset();
console.log("after reset, overall utilization:", budget.overallUtilization());
