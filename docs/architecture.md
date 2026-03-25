# Architecture

## Zones

A `Zone` wraps either a `targetPercent` (a share of the total window) or a
`hardCapTokens` (an absolute ceiling). `Zone.capTokens(totalTokens)` resolves
whichever kind of cap was configured. Zones also track `used` tokens and a
`borrowed` adjustment applied during rebalancing.

## ContextBudget

`ContextBudget` owns a map of named zones plus the total window size. It is
the public surface for recording usage (`recordUsage`, `recordText`),
inspecting capacity (`remaining`, `utilization`, `snapshot`), resetting state
between conversation turns (`reset`), and triggering rebalancing
(`rebalance`).

## Rebalancing

`rebalance(zones, totalTokens)` finds zones whose usage exceeds their
effective cap, then tries to borrow spare capacity from other zones:

1. Overflowing zones are processed highest-priority first.
2. For each one, lendable zones with spare capacity are sorted lowest-priority
   first and drained until the deficit is covered or lenders run out.
3. Any deficit left over after borrowing is reported as a `compress` action.

The default strategy lives in `rebalance.ts`; a custom `RebalanceStrategy`
can be passed into `ContextBudget`'s constructor to replace it entirely.

## Config validation

`parseBudgetConfig()` (used by the CLI) validates `totalTokens` and, for
every zone, checks the types of `targetPercent`, `hardCapTokens`, `priority`,
and `lendable` before constructing a `ContextBudget`, so malformed JSON
configs fail fast with a specific error message instead of a confusing
runtime failure deep inside `Zone`.

## CLI exit codes

`cba status`/`cba report` return `0` when every zone is within budget, `1`
for usage errors, and `2` when a zone still needs compression after
rebalancing - so the CLI can be used as a CI gate.
