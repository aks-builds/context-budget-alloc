# context-budget-alloc

![CI](https://github.com/aks-builds/context-budget-alloc/actions/workflows/ci.yml/badge.svg)
![license](https://img.shields.io/badge/license-MIT-blue.svg)

## Table of contents

- [Why](#context-budget-alloc)
- [Usage](#usage)
- [CLI](#cli)


Large language model prompts are assembled from several distinct kinds of
content: a system prompt, tool/function definitions, retrieved context,
conversation history, and headroom for the model's own output. Each of these
competes for the same fixed context window, and it is easy for one of them
(usually retrieval or history) to silently crowd out the rest.

**context-budget-alloc** is a small TypeScript library (and CLI) that treats
a context window as a budget split across named *zones*. Each zone gets a
target share of the window, or a hard token cap. The library tracks live
usage per zone, tells you how much room is left, and, when a zone is about
to overflow, either borrows spare capacity from an underused zone or reports
which zone needs to be compressed.

Status: core budget/zone tracking is in place; rebalancing and the CLI are
still being built.

## Usage

\`\`\`ts
import { ContextBudget } from "context-budget-alloc";

const budget = new ContextBudget({
  totalTokens: 128000,
  zones: [
    { name: "system", targetPercent: 0.05 },
    { name: "tools", targetPercent: 0.15 },
    { name: "retrieval", targetPercent: 0.3 },
    { name: "history", targetPercent: 0.4 },
    { name: "buffer", targetPercent: 0.1 },
  ],
});

budget.recordUsage("retrieval", 12000);
console.log(budget.remaining("retrieval"));
console.log(budget.utilization("retrieval"));
\`\`\`

## CLI

\`\`\`sh
npx cba init                       # write a starter cba.config.json
npx cba status cba.config.json     # print zone utilization
\`\`\`

## More

- [Architecture overview](docs/architecture.md)
- [Examples](examples/)
