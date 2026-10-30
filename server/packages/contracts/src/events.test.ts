import { describe, expect, it } from 'vitest';
import { uuidv7 } from './uuid.js';
import { createEvent, EVENT_TYPES, eventEnvelopeSchema } from './events.js';

describe('uuidv7', () => {
  it('has version 7 and RFC variant bits', () => {
    const id = uuidv7();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('is time-sortable', () => {
    const a = uuidv7(1_000_000_000_000);
    const b = uuidv7(1_000_000_000_001);
    expect(a < b).toBe(true);
  });

  it('is unique across many calls', () => {
    const ids = new Set(Array.from({ length: 5000 }, () => uuidv7()));
    expect(ids.size).toBe(5000);
  });
});

describe('createEvent', () => {
  it('builds a valid envelope', () => {
    const e = createEvent({
      type: EVENT_TYPES.KEY_REVOKED,
      producer: 'identity',
      payload: { keyId: 'k1' },
      aggregateId: 'k1',
      aggregateVersion: 3,
    });
    expect(eventEnvelopeSchema.safeParse(e).success).toBe(true);
    expect(e.schemaVersion).toBe(1);
  });

  it('rejects unknown event types', () => {
    const bad = { ...createEvent({ type: EVENT_TYPES.KEY_CREATED, producer: 'x', payload: {} }), type: 'nope' };
    expect(eventEnvelopeSchema.safeParse(bad).success).toBe(false);
  });
});