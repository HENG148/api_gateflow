/**
 * Paths that must never reach a log sink. Pino's `redact` replaces the value
 * with "[REDACTED]" before serialization.
 *
 * Wildcards: `*.x` matches one level deep, `*.*.x` two levels deep.
 */
export const REDACT_PATHS: string[] = [
  // inbound request credentials
  'req.headers.authorization',
  'req.headers["x-api-key"]',
  'req.headers.cookie',
  'req.headers["proxy-authorization"]',
  // outbound response credentials
  'res.headers["set-cookie"]',
  // generic secret-ish field names at depth 1 and 2
  '*.password',
  '*.secret',
  '*.apiKey',
  '*.api_key',
  '*.token',
  '*.accessToken',
  '*.refreshToken',
  '*.authorization',
  '*.*.password',
  '*.*.secret',
  '*.*.apiKey',
  '*.*.token',
  // top-level
  'password',
  'secret',
  'apiKey',
  'token',
  'authorization',
];

export const REDACT_CENSOR = '[REDACTED]';