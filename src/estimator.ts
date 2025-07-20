import type { TokenCounter } from "./types.js";

/** Rough tokenizer-agnostic estimate: ~4 characters per token. */
export const charsPerFourEstimator: TokenCounter = (text) => {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
};

export const defaultEstimator: TokenCounter = charsPerFourEstimator;
