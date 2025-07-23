import { describe, expect, it } from "vitest";
import { charsPerFourEstimator } from "../src/estimator.js";

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
});
