export class ContextBudgetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContextBudgetError";
  }
}

export class DuplicateZoneError extends ContextBudgetError {
  constructor(name: string) {
    super(`Zone "${name}" already exists.`);
    this.name = "DuplicateZoneError";
  }
}

export class UnknownZoneError extends ContextBudgetError {
  constructor(name: string) {
    super(`Zone "${name}" does not exist.`);
    this.name = "UnknownZoneError";
  }
}

export class InvalidZoneConfigError extends ContextBudgetError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidZoneConfigError";
  }
}
