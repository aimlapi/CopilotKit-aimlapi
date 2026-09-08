import { describe, it, expect } from "vitest";
import {
  AIMLAPI_ATTRIBUTION_HEADERS,
  AIMLAPI_PARTNER_ID,
  AIMLAPI_PARTNER_ID_PATTERN,
  isAimlapiOrigin,
  withAimlapiAttribution,
} from "../aimlapi-attribution";

describe("aimlapi partner id", () => {
  it("is a well-formed, registered id", () => {
    // Deliberately not "empty or well-formed": that shape stayed green whether
    // the id was present or had silently reverted to "", which is exactly the
    // regression worth catching now that a real id exists.
    expect(AIMLAPI_PARTNER_ID_PATTERN.test(AIMLAPI_PARTNER_ID)).toBe(true);
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
});

describe("origin scoping", () => {
  it("accepts our own origin", () => {
    expect(isAimlapiOrigin("https://api.aimlapi.com/v1")).toBe(true);
    expect(isAimlapiOrigin("https://api.aimlapi.com")).toBe(true);
  });

  it("rejects everything else, including look-alikes", () => {
    for (const url of [
      "http://api.aimlapi.com/v1", // plaintext would expose the bearer too
      "https://api.aimlapi.com.example.net/v1", // suffix look-alike
      "https://api.openai.com/v1",
      "http://127.0.0.1:8814/v1",
      "not a url",
      undefined,
    ]) {
      expect(isAimlapiOrigin(url)).toBe(false);
    }
  });
});

describe("header attachment", () => {
  it("attaches all four headers for our origin", () => {
    const headers = withAimlapiAttribution("https://api.aimlapi.com/v1");
    expect(headers).toMatchObject({
      "HTTP-Referer": "https://github.com/CopilotKit/CopilotKit",
      "X-Title": "CopilotKit",
      "X-AIMLAPI-Source": "agent/copilotkit",
      "X-AIMLAPI-Partner-ID": AIMLAPI_PARTNER_ID,
    });
  });

  it("attaches nothing anywhere else, and passes the caller's headers through", () => {
    expect(withAimlapiAttribution(undefined)).toBeUndefined();
    expect(withAimlapiAttribution("https://api.openai.com/v1")).toBeUndefined();
    expect(
      withAimlapiAttribution("https://api.openai.com/v1", { "X-Trace": "1" }),
    ).toEqual({ "X-Trace": "1" });
  });

  it("lets the caller's own header win on a clash", () => {
    const headers = withAimlapiAttribution("https://api.aimlapi.com/v1", {
      "X-Title": "My App",
    });
    expect(headers?.["X-Title"]).toBe("My App");
    expect(headers?.["X-AIMLAPI-Partner-ID"]).toBe(AIMLAPI_PARTNER_ID);
  });

  it("does not let a caller mutate the shared constant", () => {
    const headers = withAimlapiAttribution("https://api.aimlapi.com/v1")!;
    headers["X-Title"] = "mutated";
    expect(AIMLAPI_ATTRIBUTION_HEADERS["X-Title"]).toBe("CopilotKit");
  });
});
