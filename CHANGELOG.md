# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

## [0.2.0] - 2026-04-02

### Added
- `createBudget()` factory function and `ContextBudget.reset()`/`Zone.reset()` for reusing a budget across conversation turns.
- Color-coded utilization in `cba status`, plus exit code 2 when a zone still needs compression after rebalancing.
- Per-zone field type validation when parsing budget configs.
- Pluggable `RebalanceStrategy` support via `ContextBudget`'s constructor.
- Architecture overview and CONTRIBUTING docs.
- `examples/basic-usage.ts`, `examples/custom-strategy.ts`, and `examples/token-tracking-loop.ts`.

### Fixed
- The CLI's `--version` output no longer drifts from `package.json`.
- Malformed usage log entries now report the offending line number.

## [0.1.0] - 2025-12-12

### Added
- `ContextBudget` and `Zone` for tracking per-zone token usage against a target percent or hard token cap, with zone priority and lendable flags.
- `rebalance()` for borrowing spare capacity between zones and flagging zones that need compression.
- `charsPerFourEstimator` and `wordBasedEstimator`, tokenizer-agnostic token estimators, pluggable via `recordText()`.
- `cba` CLI with `init`, `status`, and `report` commands.
- Typed error classes: `DuplicateZoneError`, `UnknownZoneError`, `InvalidZoneConfigError`.
