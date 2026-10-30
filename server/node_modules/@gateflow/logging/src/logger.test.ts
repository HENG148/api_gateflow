import { describe, expect, it } from 'vitest';
import { Writable } from 'node:stream';
import { createLogger } from './logger.js';

function capture() {
  const lines: Record<string, unknown>[] = [];
  const destination = new Writable({
    write(chunk, _enc, cb) {
      lines.push(JSON.parse(chunk.toString()));
      cb();
    },
  });
  return { lines, destination };
}

describe('createLogger', () => {
  it('adds service, version and string level', () => {
    const { lines, destination } = capture();
    const log = createLogger({ service: 'identity', version: '1.2.3', destination });
    log.info('hello');
    expect(lines[0]).toMatchObject({ service: 'identity', version: '1.2.3', level: 'info', msg: 'hello' });
    expect(typeof lines[0]?.time).toBe('string');
  });

  it('redacts credential headers', () => {
    const { lines, destination } = capture();
    const log = createLogger({ service: 'gateway', destination });
    log.info(
      {
        req: {
          headers: {
            authorization: 'Bearer gf_abc_supersecret',
            'x-api-key': 'gf_abc_supersecret',
            cookie: 'sid=1',
            'user-agent': 'curl',
          },
        },
      },
      'request',
    );
    const headers = (lines[0]?.req as { headers: Record<string, string> }).headers;
    expect(headers.authorization).toBe('[REDACTED]');
    expect(headers['x-api-key']).toBe('[REDACTED]');
    expect(headers.cookie).toBe('[REDACTED]');
    expect(headers['user-agent']).toBe('curl');
    expect(JSON.stringify(lines[0])).not.toContain('supersecret');
  });

  it('redacts secret-like fields at depth 1 and 2 and top level', () => {
    const { lines, destination } = capture();
    const log = createLogger({ service: 'identity', destination });
    log.info({ user: { password: 'hunter2' }, a: { b: { secret: 's3' } }, token: 't' }, 'x');
    const out = JSON.stringify(lines[0]);
    expect(out).not.toContain('hunter2');
    expect(out).not.toContain('s3');
    expect(lines[0]?.token).toBe('[REDACTED]');
  });

  it('supports extra redact paths', () => {
    const { lines, destination } = capture();
    const log = createLogger({ service: 'x', destination, extraRedact: ['pepper'] });
    log.info({ pepper: 'p' }, 'x');
    expect(lines[0]?.pepper).toBe('[REDACTED]');
  });
});