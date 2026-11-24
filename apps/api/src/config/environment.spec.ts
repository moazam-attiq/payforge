import { validateEnvironment } from './environment';

const validEnvironment = {
  NODE_ENV: 'development',
  PORT: '3100',
  DATABASE_URL: 'postgresql://payforge:payforge@localhost:5432/payforge',
  REDIS_URL: 'redis://localhost:6379',
  JWT_ACCESS_SECRET: 'access-secret-that-is-at-least-32-characters',
  JWT_REFRESH_SECRET: 'refresh-secret-that-is-at-least-32-characters',
  APP_ENCRYPTION_KEY_V1: Buffer.alloc(32, 3).toString('base64'),
  API_KEY_PEPPER: 'api-key-pepper-that-is-at-least-32-characters',
  WEBHOOK_SECRET_ENCRYPTION_KEY: Buffer.alloc(32, 4).toString('base64'),
  DASHBOARD_ORIGIN: 'http://localhost:5173',
};

describe('validateEnvironment', () => {
  it('parses valid values and supplies documented defaults', () => {
    const environment = validateEnvironment(validEnvironment);

    expect(environment).toMatchObject({
      PORT: 3100,
      ACCESS_TOKEN_TTL: '15m',
      REFRESH_TOKEN_TTL: '30d',
      ACTIVE_ENCRYPTION_KEY_VERSION: 1,
      LOG_LEVEL: 'info',
    });
  });

  it('provides isolated defaults for the test environment', () => {
    const environment = validateEnvironment({ NODE_ENV: 'test' });

    expect(environment.NODE_ENV).toBe('test');
    expect(environment.LOG_LEVEL).toBe('silent');
  });

  it('rejects missing security-critical values without exposing values', () => {
    expect(() =>
      validateEnvironment({
        NODE_ENV: 'production',
        JWT_ACCESS_SECRET: 'do-not-leak-this-short-value',
      }),
    ).toThrow('DATABASE_URL');

    try {
      validateEnvironment({
        NODE_ENV: 'production',
        JWT_ACCESS_SECRET: 'do-not-leak-this-short-value',
      });
    } catch (error) {
      expect((error as Error).message).not.toContain(
        'do-not-leak-this-short-value',
      );
    }
  });

  it('requires independent access and refresh secrets', () => {
    const sharedSecret = 'shared-secret-that-is-at-least-32-characters';

    expect(() =>
      validateEnvironment({
        ...validEnvironment,
        JWT_ACCESS_SECRET: sharedSecret,
        JWT_REFRESH_SECRET: sharedSecret,
      }),
    ).toThrow('JWT_REFRESH_SECRET: must differ from JWT_ACCESS_SECRET');
  });
});
