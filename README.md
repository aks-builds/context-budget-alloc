# context-budget-alloc

![CI](https://github.com/aks-builds/context-budget-alloc/actions/workflows/ci.yml/badge.svg)
![license](https://img.shields.io/badge/license-MIT-blue.svg)

## Table of contents

- [Why](#context-budget-alloc)
- [Features](#features)
- [Usage](#usage)
- [CLI](#cli)
- [Exit codes](#exit-codes)
- [FAQ](#faq)
- [More](#more)

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

## Features

- Named zones with a `targetPercent` share or a `hardCapTokens` ceiling.
- Live per-zone and overall utilization tracking.
- Dynamic rebalancing: borrow spare capacity from underused, lendable zones
  before falling back to a `compress` signal.
- Zone priority controls who borrows first and who lends first.
- Tokenizer-agnostic estimators (`charsPerFourEstimator`, `wordBasedEstimator`)
  or bring your own via `recordText()`.
- Pluggable `RebalanceStrategy` if the default borrow/compress policy is not
  what you want.
- A `cba` CLI (`init`, `status`, `report`) for inspecting a budget from a
  JSON config and an optional JSONL usage log.

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
npx cba init                              # write a starter cba.config.json
npx cba status cba.config.json            # print a color-coded zone utilization table
npx cba status cba.config.json --json     # ...or the same data as JSON
npx cba report cba.config.json            # shorthand for status --json
npx cba status cba.config.json examples/usage-log.sample.jsonl  # replay a usage log first
\`\`\`

## Exit codes

`cba status` and `cba report` exit with:

- `0` - every zone is within its budget
- `1` - a usage error (missing or invalid arguments/config)
- `2` - a zone overflowed and still needs compression after rebalancing

## FAQ

**Why chars/4 instead of a real tokenizer?** So the library works for any
model without a hard dependency on a specific tokenizer package. Pass your
own `TokenCounter` (e.g. a wrapper around `tiktoken`) via `counter` in
`BudgetConfig` if you need exact counts.

## More

- [Architecture overview](docs/architecture.md)
- [Examples](examples/)
