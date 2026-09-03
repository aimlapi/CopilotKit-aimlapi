import { describe, it, expect } from "vitest";
import {
  AIMLAPI_PARTNER_ID,
  AIMLAPI_PARTNER_ID_PATTERN,
} from "../aimlapi-attribution";

describe("aimlapi partner id placeholder", () => {
  it("is either empty (unregistered) or a well-formed partner id", () => {
    expect(
      AIMLAPI_PARTNER_ID === "" ||
        AIMLAPI_PARTNER_ID_PATTERN.test(AIMLAPI_PARTNER_ID),
    ).toBe(true);
  });

  it("rejects the shapes a hand-written id usually gets wrong", () => {
    // The gateway accepts a request carrying any of these and drops the
    // attribution silently, so nothing but this assertion catches them.
    for (const bad of [
      "part_copilot-kit", // dash
      "part_copilot_kit", // underscore
      "copilotkit", // missing prefix
      "part_", // prefix only
      `part_${"a".repeat(65)}`, // over 64 characters
    ]) {
      expect(AIMLAPI_PARTNER_ID_PATTERN.test(bad)).toBe(false);
    }
  });

  it("accepts a readable id of the shape other integrations registered", () => {
    expect(AIMLAPI_PARTNER_ID_PATTERN.test("part_B5Xmawp87YODJfuBUtiCbR2m")).toBe(true);
  });
});
