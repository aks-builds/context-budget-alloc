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

function printStatus(config: BudgetConfig, logPath?: string): void {
  const budget = new ContextBudget(config);
  if (logPath) {
    for (const entry of loadUsageLog(logPath)) {
      budget.recordUsage(entry.zone, entry.tokens);
    }
  }
  console.log(`Total window: ${config.totalTokens} tokens\n`);
  for (const zoneConfig of config.zones) {
    const remaining = budget.remaining(zoneConfig.name);
    const util = budget.utilization(zoneConfig.name);
    console.log(`${zoneConfig.name}: remaining=${remaining} utilization=${(util * 100).toFixed(1)}%`);
  }
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

  if (command === "status") {
    const configPath = rest[0];
    if (!configPath) {
      console.error("Usage: cba status <config> [log]");
      process.exitCode = 1;
      return;
    }
    printStatus(loadBudgetConfigFile(configPath), rest[1]);
    return;
  }

  console.error(`Unknown command: ${command}\n`);
  console.log(HELP);
  process.exitCode = 1;
}

main();
