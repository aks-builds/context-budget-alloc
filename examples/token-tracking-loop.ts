import { createBudget } from "../src/index.js";

// Simulates tracking a multi-turn conversation against a fixed context
// window, rebalancing after each turn and starting fresh each time the
// conversation is summarized away.
const budget = createBudget({
  totalTokens: 32000,
  zones: [
    { name: "system", targetPercent: 0.05, lendable: false },
    { name: "tools", targetPercent: 0.1 },
    { name: "history", targetPercent: 0.65, priority: 1 },
    { name: "buffer", targetPercent: 0.2, priority: 0 },
  ],
});

const turns = [
  "User: what's the weather in Lisbon?",
  "Assistant: let me check that tool.",
  "User: also compare it to last week.",
];

for (const turn of turns) {
  budget.recordText("history", turn);
  const result = budget.rebalance();
  if (!result.resolved) {
    console.log("needs compression:", result.actions);
  }
}

console.log(budget.snapshot());
budget.reset();
console.log("after reset:", budget.snapshot().overallUtilization);
