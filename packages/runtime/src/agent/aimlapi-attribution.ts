/**
 * Fork-only scaffolding — not part of the upstream contribution.
 *
 * The Built-in Agent reaches aimlapi.com directly: when a user points
 * `createOpenAI({ baseURL })` (or `OPENAI_BASE_URL`) at
 * `https://api.aimlapi.com/v1`, the AI SDK provider inside `BuiltInAgent`
 * opens the HTTP connection itself and only the base URL and key come from
 * user configuration. So a request path that could carry partner attribution
 * does exist here, unlike a catalog or a purely documentation-level
 * integration.
 *
 * Upstream declined to special-case a gateway inside `resolveModel`
 * (CopilotKit/CopilotKit#6584: "It also sets a precedent we'd have to apply
 * evenhandedly to every gateway that asks"). That objection is respected: the
 * upstream-facing change is a generic `headers` option on
 * `BuiltInAgentClassicConfig`, naming no provider. This module is the fork-only
 * half that fills those headers in for our own endpoint, and it is expected to
 * be dropped before anything is offered upstream.
 */

/**
 * Gateway contract for the `X-AIMLAPI-Partner-ID` header: the literal prefix
 * `part_` followed by 1-64 alphanumerics. No dashes, no underscores.
 */
export const AIMLAPI_PARTNER_ID_PATTERN = /^part_[A-Za-z0-9]{1,64}$/;

export const AIMLAPI_PARTNER_ID = "part_B5Xmawp87YODJfuBUtiCbR2m";

/**
 * The origin the headers are scoped to. Both halves matter.
 *
 * The host half keeps our partner id from travelling to somebody else's
 * gateway when a user repoints `OPENAI_BASE_URL`. The scheme half keeps the id
 * — and the Authorization bearer beside it — off a plaintext connection: a
 * name that resolves to `http://api.aimlapi.com:1234` inside a container's DNS
 * would otherwise be handed both.
 */
const AIMLAPI_ORIGIN = "https://api.aimlapi.com";

export const AIMLAPI_ATTRIBUTION_HEADERS: Readonly<Record<string, string>> =
  Object.freeze({
    "HTTP-Referer": "https://github.com/CopilotKit/CopilotKit",
    "X-Title": "CopilotKit",
    "X-AIMLAPI-Source": "agent/copilotkit",
    "X-AIMLAPI-Partner-ID": AIMLAPI_PARTNER_ID,
  });

/**
 * True only when `baseURL` names our own origin — exact host, https scheme.
 *
 * A look-alike such as `https://api.aimlapi.com.example.net/v1` is rejected,
 * because the comparison is on the parsed origin rather than a substring.
 */
export function isAimlapiOrigin(baseURL: string | undefined): boolean {
  if (!baseURL) return false;
  try {
    return new URL(baseURL).origin === AIMLAPI_ORIGIN;
  } catch {
    return false;
  }
}

/**
 * Merges attribution into the caller's headers when, and only when, the
 * request is bound for our origin. The caller's own headers win on a clash —
 * an application that deliberately sets `X-Title` keeps its value.
 */
export function withAimlapiAttribution(
  baseURL: string | undefined,
  headers?: Record<string, string>,
): Record<string, string> | undefined {
  if (!isAimlapiOrigin(baseURL)) return headers;
  return { ...AIMLAPI_ATTRIBUTION_HEADERS, ...(headers ?? {}) };
}
