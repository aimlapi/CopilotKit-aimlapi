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
 * No partner id has been registered for CopilotKit, so this constant is
 * deliberately EMPTY. An invented value would be worse than none: the gateway
 * accepts the request either way and silently drops a malformed id, so a typo
 * never surfaces at runtime and the traffic simply earns nothing. The
 * accompanying test is the only thing that can catch that, which is why it
 * asserts empty-or-well-formed rather than merely non-empty.
 *
 * Nothing imports this, and nothing should until an id exists. Sending the
 * headers would mean scoping them to our origin, which in this codebase means
 * a hardcoded aimlapi base URL inside `resolveModel` — precisely the change
 * upstream declined in CopilotKit/CopilotKit#6584 ("It also sets a precedent
 * we'd have to apply evenhandedly to every gateway that asks, which isn't a
 * list we want inside `resolveModel`").
 */
export const AIMLAPI_PARTNER_ID = "part_B5Xmawp87YODJfuBUtiCbR2m";

/**
 * Gateway contract for the `X-AIMLAPI-Partner-ID` header: the literal prefix
 * `part_` followed by 1-64 alphanumerics. No dashes, no underscores.
 */
export const AIMLAPI_PARTNER_ID_PATTERN = /^part_[A-Za-z0-9]{1,64}$/;
