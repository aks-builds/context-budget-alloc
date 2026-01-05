import type { RebalanceResult } from "./types.js";
import type { Zone } from "./zone.js";

/** A pluggable strategy for resolving overflowing zones during rebalance(). */
export type RebalanceStrategy = (zones: Zone[], totalTokens: number) => RebalanceResult;
