# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Added
- Pluggable `RebalanceStrategy` support via `ContextBudget`'s constructor.
- Architecture overview and CONTRIBUTING docs.
- `examples/basic-usage.ts` and `examples/custom-strategy.ts`.

## [0.1.0] - 2025-12-12

### Added
- `ContextBudget` and `Zone` for tracking per-zone token usage against a target percent or hard token cap, with zone priority and lendable flags.
- `rebalance()` for borrowing spare capacity between zones and flagging zones that need compression.
- `charsPerFourEstimator` and `wordBasedEstimator`, tokenizer-agnostic token estimators, pluggable via `recordText()`.
- `cba` CLI with `init`, `status`, and `report` commands.
- Typed error classes: `DuplicateZoneError`, `UnknownZoneError`, `InvalidZoneConfigError`.
