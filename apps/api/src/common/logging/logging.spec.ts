import { PassThrough } from 'node:stream';
import pino from 'pino';
import {
  createLoggerParams,
  LOGGER_REDACTION,
  REDACTED_VALUE,
  resolveRequestId,
} from './logging';

describe('logging configuration', () => {
  it('uses readable output only in development', () => {
    expect(createLoggerParams('development', 'debug')).toMatchObject({
      pinoHttp: {
        level: 'debug',
        transport: {
          target: 'pino-pretty',
        },
      },
    });

    expect(createLoggerParams('production', 'info')).toMatchObject({
      pinoHttp: {
        level: 'info',
        transport: undefined,
      },
    });
  });

  it('accepts a safe incoming request ID', () => {
    expect(resolveRequestId('merchant-request_123', () => 'generated')).toBe(
      'merchant-request_123',
    );
  });

  it.each([['contains spaces'], ['bad/request-id'], [['multiple', 'values']]])(
    'replaces an unsafe incoming request ID',
    (value) => {
      expect(resolveRequestId(value, () => 'generated')).toBe('generated');
    },
  );

  it('redacts credentials and PII from structured logs', () => {
    const stream = new PassThrough();
    let output = '';

    stream.on('data', (chunk: Buffer) => {
      output += chunk.toString('utf8');
    });

    const logger = pino({ redact: LOGGER_REDACTION }, stream);

    logger.info({
      accessToken: 'access-token-value',
      config: {
        API_KEY_PEPPER: 'pepper-value',
      },
      req: {
        headers: {
          authorization: 'Bearer secret-value',
        },
        body: {
          email: 'customer@example.com',
          password: 'password-value',
        },
      },
    });

    expect(output).toContain(REDACTED_VALUE);
    expect(output).not.toContain('access-token-value');
    expect(output).not.toContain('pepper-value');
    expect(output).not.toContain('secret-value');
    expect(output).not.toContain('customer@example.com');
    expect(output).not.toContain('password-value');
  });
});
