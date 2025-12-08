import { describe, expect, it } from "vitest";
import { DuplicateZoneError, InvalidZoneConfigError, UnknownZoneError } from "../src/errors.js";

describe("error classes", () => {
  it("sets a descriptive message and name for DuplicateZoneError", () => {
    const err = new DuplicateZoneError("tools");
    expect(err.name).toBe("DuplicateZoneError");
    expect(err.message).toContain("tools");
  });

  it("sets a descriptive message and name for UnknownZoneError", () => {
    const err = new UnknownZoneError("ghost");
    expect(err.name).toBe("UnknownZoneError");
    expect(err.message).toContain("ghost");
  });

  it("carries a custom message for InvalidZoneConfigError", () => {
    const err = new InvalidZoneConfigError("bad config");
    expect(err.message).toBe("bad config");
  });
});
