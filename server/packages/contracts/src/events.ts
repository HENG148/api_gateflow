import { z } from 'zod';
import { uuidv7 } from './uuid.js';

/** Routing keys on the `gateflow.events` topic exchange (see docs/architecture.md §4.3). */
export const EVENT_TYPES = {
  KEY_CREATED: 'key.created',
  KEY_ROTATED: 'key.rotated',
  KEY_REVOKED: 'key.revoked',
  ROUTE_CONFIG_PUBLISHED: 'route.config.published',
  CONFIG_REJECTED: 'config.rejected',
  POLICY_BUNDLE_PUBLISHED: 'policy.bundle.published',
  QUOTA_THRESHOLD_REACHED: 'quota.threshold.reached',
  USAGE_RECORDED: 'usage.recorded',
  USAGE_AGGREGATED: 'usage.aggregated',
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

export const EVENT_EXCHANGE = 'gateflow.events';

const eventTypeValues = Object.values(EVENT_TYPES) as [EventType, ...EventType[]];

/**
 * Every event on the bus uses this envelope. Consumers dedupe on `eventId`
 * and ignore stale `aggregateVersion`s. Payloads carry identifiers and
 * versions, not full state.
 */
export const eventEnvelopeSchema = z.object({
  eventId: z.string().uuid(),
  type: z.enum(eventTypeValues),
  schemaVersion: z.literal(1),
  occurredAt: z.string().datetime(),
  producer: z.string().min(1),
  correlationId: z.string().min(1).optional(),
  aggregateId: z.string().min(1).optional(),
  aggregateVersion: z.number().int().nonnegative().optional(),
  payload: z.record(z.string(), z.unknown()),
});

export type EventEnvelope = z.infer<typeof eventEnvelopeSchema>;

export interface NewEventInput {
  type: EventType;
  producer: string;
  payload: Record<string, unknown>;
  correlationId?: string;
  aggregateId?: string;
  aggregateVersion?: number;
}

export function createEvent(input: NewEventInput, now: Date = new Date()): EventEnvelope {
  return eventEnvelopeSchema.parse({
    eventId: uuidv7(now.getTime()),
    schemaVersion: 1,
    occurredAt: now.toISOString(),
    ...input,
  });
}