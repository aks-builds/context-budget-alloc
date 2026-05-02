import type { ContextBudget } from "../src/index.js";

interface ChatMessage {
  role: string;
  content: string;
}

// Framework-agnostic sketch of wiring ContextBudget into a request handler.
// Swap the message shape for whatever your HTTP framework/SDK gives you.
export function trackRequestBudget(budget: ContextBudget, messages: ChatMessage[]) {
  for (const message of messages) {
    const zone = message.role === "system" ? "system" : "history";
    budget.recordText(zone, message.content);
  }

  const result = budget.rebalance();
  if (!result.resolved) {
    throw new Error(`Context budget exceeded: ${JSON.stringify(result.actions)}`);
  }
  return budget.snapshot();
}
