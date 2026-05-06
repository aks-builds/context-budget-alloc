import type { TokenCounter } from "./types.js";

/**
 * Rough tokenizer-agnostic estimate: ~4 characters per token. Counts Unicode
 * code points (via Array.from) rather than UTF-16 code units, so a string
 * containing surrogate-pair characters (many emoji, some scripts) is not
 * over-counted.
 */
export const charsPerFourEstimator: TokenCounter = (text) => {
  if (!text) return 0;
  const length = Array.from(text).length;
  return Math.max(1, Math.ceil(length / 4));
};

/** Rougher word-based estimate: ~0.75 tokens per whitespace-separated word. */
export const wordBasedEstimator: TokenCounter = (text) => {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return 0;
  return Math.max(1, Math.ceil(words / 0.75));
};

export const defaultEstimator: TokenCounter = charsPerFourEstimator;
