import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { computeExitCode, loadUsageLog, sampleConfig } from "../src/cli.js";

describe("cli helpers", () => {
  it("produces a sample config with five zones", () => {
    const config = sampleConfig();
    expect(config.zones).toHaveLength(5);
    expect(config.zones.map((z) => z.name)).toContain("retrieval");
  });

  it("loads a JSONL usage log", () => {
    const dir = mkdtempSync(join(tmpdir(), "cba-"));
    const file = join(dir, "log.jsonl");
    writeFileSync(file, '{"zone":"tools","tokens":5}\n{"zone":"history","tokens":10}\n');
    const entries = loadUsageLog(file);
    expect(entries).toEqual([
      { zone: "tools", tokens: 5 },
      { zone: "history", tokens: 10 },
    ]);
  });

  it("skips blank lines in a usage log", () => {
    const dir = mkdtempSync(join(tmpdir(), "cba-"));
    const file = join(dir, "log.jsonl");
    writeFileSync(file, '{"zone":"tools","tokens":5}\n\n\n{"zone":"history","tokens":10}\n');
    expect(loadUsageLog(file)).toHaveLength(2);
  });

  it("reports the line number for a malformed usage log entry", () => {
    const dir = mkdtempSync(join(tmpdir(), "cba-"));
    const file = join(dir, "log.jsonl");
    writeFileSync(file, '{"zone":"tools","tokens":5}\nnot json\n');
    expect(() => loadUsageLog(file)).toThrow(/:2:/);
  });

  it("maps a resolved rebalance to exit code 0", () => {
    expect(computeExitCode({ actions: [], resolved: true })).toBe(0);
  });

  it("maps an unresolved rebalance to exit code 2", () => {
    expect(computeExitCode({ actions: [{ type: "compress", zone: "a", amount: 5 }], resolved: false })).toBe(2);
  });
});
