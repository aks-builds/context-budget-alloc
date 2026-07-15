#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { BudgetConfig, RebalanceResult } from "./types.js";
import { ContextBudget } from "./budget.js";
import { loadBudgetConfigFile } from "./config.js";

const VERSION = "1.0.0";

const HELP = `context-budget-alloc (cba) - manage an LLM context-window token budget

Usage:
  cba init [path]                    Write a starter budget config to [path] (default: cba.config.json)
  cba status <config> [log] [--json] Print zone utilization (table, or JSON with --json)
  cba report <config> [log]          Print a JSON snapshot (same as status --json)
  cba --help                         Show this help
  cba --version                      Show the installed version

Exit codes:
  0  every zone is within its budget
  1  usage error (missing/invalid arguments or config)
  2  a zone overflowed and still needs compression after rebalancing
`;

export function sampleConfig(): BudgetConfig {
  return {
    totalTokens: 128000,
    zones: [
      { name: "system", targetPercent: 0.05, priority: 3, lendable: false },
      { name: "tools", targetPercent: 0.15, priority: 2 },
      { name: "retrieval", targetPercent: 0.3, priority: 1 },
      { name: "history", targetPercent: 0.4, priority: 1 },
      { name: "buffer", targetPercent: 0.1, priority: 0 },
    ],
  };
}

export function loadUsageLog(path: string): Array<{ zone: string; tokens: number }> {
  const lines = readFileSync(path, "utf8").split("\n");
  const entries: Array<{ zone: string; tokens: number }> = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
      entries.push(JSON.parse(line));
    } catch (cause) {
      throw new Error(`Malformed usage log entry at ${path}:${i + 1}: ${line}`, { cause });
    }
  }
  return entries;
}

export function computeExitCode(result: RebalanceResult): number {
  return result.resolved ? 0 : 2;
}

function buildBudget(config: BudgetConfig, logPath?: string): ContextBudget {
  const budget = new ContextBudget(config);
  if (logPath) {
    for (const entry of loadUsageLog(logPath)) {
      budget.recordUsage(entry.zone, entry.tokens);
    }
  }
  return budget;
}

function colorize(text: string, util: number): string {
  if (!Number.isFinite(util)) return `\x1b[31m${text}\x1b[0m`;
  if (util >= 0.9) return `\x1b[31m${text}\x1b[0m`;
  if (util >= 0.7) return `\x1b[33m${text}\x1b[0m`;
  return `\x1b[32m${text}\x1b[0m`;
}

function printTable(config: BudgetConfig, logPath?: string): number {
  const budget = buildBudget(config, logPath);
  const result = budget.rebalance();
  const snapshot = budget.snapshot();

  const nameWidth = Math.max(4, ...snapshot.zones.map((z) => z.name.length));
  console.log(`Total window: ${snapshot.totalTokens} tokens\n`);
  console.log(
    `${"ZONE".padEnd(nameWidth)}  ${"CAP".padStart(8)}  ${"USED".padStart(8)}  ${"REMAINING".padStart(10)}  UTIL`
  );
  for (const zone of snapshot.zones) {
    const utilText = Number.isFinite(zone.utilization) ? `${(zone.utilization * 100).toFixed(1)}%` : "n/a";
    console.log(
      `${zone.name.padEnd(nameWidth)}  ${String(zone.capTokens).padStart(8)}  ${String(zone.usedTokens).padStart(8)}  ${String(zone.remainingTokens).padStart(10)}  ${colorize(utilText, zone.utilization)}`
    );
  }
  console.log(`\nOverall utilization: ${(snapshot.overallUtilization * 100).toFixed(1)}%`);

  if (result.actions.length > 0) {
    console.log("\nRebalance actions:");
    for (const action of result.actions) {
      if (action.type === "borrow") {
        console.log(`  borrow ${action.amount} tokens into "${action.zone}" from "${action.from}"`);
      } else {
        console.log(`  compress "${action.zone}" by at least ${action.amount} tokens`);
      }
    }
  }
  return computeExitCode(result);
}

function printJson(config: BudgetConfig, logPath?: string): number {
  const budget = buildBudget(config, logPath);
  const result = budget.rebalance();
  console.log(JSON.stringify(budget.snapshot(), null, 2));
  return computeExitCode(result);
}

function parseArgs(argv: string[]): { command?: string; rest: string[] } {
  const [command, ...rest] = argv;
  return { command, rest };
}

function main(): void {
  const { command, rest } = parseArgs(process.argv.slice(2));

  if (!command || command === "--help" || command === "-h") {
    console.log(HELP);
    return;
  }
  if (command === "--version" || command === "-v") {
    console.log(VERSION);
    return;
  }

  if (command === "init") {
    const path = rest[0] ?? "cba.config.json";
    if (existsSync(path)) {
      console.error(`${path} already exists.`);
      process.exitCode = 1;
      return;
    }
    const dir = dirname(path);
    if (dir && dir !== "." && !existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(path, JSON.stringify(sampleConfig(), null, 2) + "\n");
    console.log(`Wrote starter config to ${path}`);
    return;
  }

  if (command === "status" || command === "report") {
    const positional = rest.filter((arg) => arg !== "--json");
    const asJson = command === "report" || rest.includes("--json");
    const configPath = positional[0];
    if (!configPath || !existsSync(configPath)) {
      console.error(`Usage: cba ${command} <config> [log] [--json]`);
      process.exitCode = 1;
      return;
    }
    const config = loadBudgetConfigFile(configPath);
    process.exitCode = asJson ? printJson(config, positional[1]) : printTable(config, positional[1]);
    return;
  }

  console.error(`Unknown command: ${command}\n`);
  console.log(HELP);
  process.exitCode = 1;
}

// Only run when this file is the process entry point, not when it is
// imported (e.g. by tests importing sampleConfig()/loadUsageLog()).
const isEntryPoint = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isEntryPoint) {
  main();
}
