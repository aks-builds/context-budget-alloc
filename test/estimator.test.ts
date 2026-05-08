import { describe, expect, it } from "vitest";
import { charsPerFourEstimator, wordBasedEstimator } from "../src/estimator.js";

describe("charsPerFourEstimator", () => {
  it("returns 0 for empty text", () => {
    expect(charsPerFourEstimator("")).toBe(0);
  });

  it("estimates roughly length/4 tokens", () => {
    expect(charsPerFourEstimator("a".repeat(40))).toBe(10);
  });

  it("returns at least 1 token for non-empty text", () => {
    expect(charsPerFourEstimator("hi")).toBe(1);
  });

  it("counts unicode code points, not UTF-16 code units", () => {
    // 4 emoji code points (each a surrogate pair in UTF-16) -> 1 token, not 2.
    expect(charsPerFourEstimator("\u{1F600}\u{1F600}\u{1F600}\u{1F600}")).toBe(1);
  });
});

describe("wordBasedEstimator", () => {
  it("returns 0 for whitespace-only text", () => {
    expect(wordBasedEstimator("   ")).toBe(0);
  });

  it("scales with word count", () => {
    expect(wordBasedEstimator("one two three four")).toBe(Math.ceil(4 / 0.75));
  });
});
