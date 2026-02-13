#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { BudgetConfig } from "./types.js";
import { ContextBudget } from "./budget.js";
import { loadBudgetConfigFile } from "./config.js";

const VERSION = "0.0.1";

const HELP = `context-budget-alloc (cba) - manage an LLM context-window token budget

Usage:
  cba init [path]              Write a starter budget config to [path] (default: cba.config.json)
  cba status <config> [log]    Print zone utilization, optionally replaying a usage log (JSONL)
  cba report <config> [log]    Print a JSON snapshot instead of a table
  cba --help                   Show this help
  cba --version                Show the installed version
`;

function sampleConfig(): BudgetConfig {
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

function loadUsageLog(path: string): Array<{ zone: string; tokens: number }> {
  return readFileSync(path, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
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

function printStatus(config: BudgetConfig, logPath?: string): void {
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
}

function printReport(config: BudgetConfig, logPath?: string): void {
  const budget = buildBudget(config, logPath);
  budget.rebalance();
  console.log(JSON.stringify(budget.snapshot(), null, 2));
}

function main(): void {
  const [, , command, ...rest] = process.argv;

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
    writeFileSync(path, JSON.stringify(sampleConfig(), null, 2) + "\n");
    console.log(`Wrote starter config to ${path}`);
    return;
  }

  if (command === "status" || command === "report") {
    const configPath = rest[0];
    if (!configPath || !existsSync(configPath)) {
      console.error(`Usage: cba ${command} <config> [log]`);
      process.exitCode = 1;
      return;
    }
    const config = loadBudgetConfigFile(configPath);
    if (command === "report") {
      printReport(config, rest[1]);
    } else {
      printStatus(config, rest[1]);
    }
    return;
  }

  console.error(`Unknown command: ${command}\n`);
  console.log(HELP);
  process.exitCode = 1;
}

main();
