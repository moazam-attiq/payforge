import { z } from 'zod';

const durationSchema = z
  .string()
  .regex(/^\d+[smhd]$/, 'must be a duration such as 15m or 30d');

const secretSchema = z.string().min(32, 'must contain at least 32 characters');

const base64KeySchema = z.string().refine(
  (value) => {
    const decoded = Buffer.from(value, 'base64');

    return decoded.length === 32 && decoded.toString('base64') === value;
  },
  { message: 'must be a base64-encoded 32-byte key' },
);

const environmentSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
    DATABASE_URL: z
      .string()
      .regex(/^postgres(?:ql)?:\/\//, 'must be a PostgreSQL connection URL'),
    REDIS_URL: z
      .string()
      .regex(/^rediss?:\/\//, 'must be a Redis connection URL'),
    JWT_ACCESS_SECRET: secretSchema,
    JWT_REFRESH_SECRET: secretSchema,
    ACCESS_TOKEN_TTL: durationSchema.default('15m'),
    REFRESH_TOKEN_TTL: durationSchema.default('30d'),
    APP_ENCRYPTION_KEY_V1: base64KeySchema,
    ACTIVE_ENCRYPTION_KEY_VERSION: z.coerce
      .number()
      .int()
      .positive()
      .default(1),
    API_KEY_PEPPER: secretSchema,
    WEBHOOK_SECRET_ENCRYPTION_KEY: base64KeySchema,
    DASHBOARD_ORIGIN: z.url(),
    LOG_LEVEL: z
      .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'])
      .default('info'),
  })
  .superRefine((environment, context) => {
    if (environment.JWT_ACCESS_SECRET === environment.JWT_REFRESH_SECRET) {
      context.addIssue({
        code: 'custom',
        message: 'must differ from JWT_ACCESS_SECRET',
        path: ['JWT_REFRESH_SECRET'],
      });
    }
  });

export type Environment = z.infer<typeof environmentSchema>;

const testDefaults: Environment = {
  NODE_ENV: 'test',
  PORT: 3000,
  DATABASE_URL: 'postgresql://test:test@localhost:5432/payforge_test',
  REDIS_URL: 'redis://localhost:6379',
  JWT_ACCESS_SECRET: 'test-access-secret-at-least-32-characters',
  JWT_REFRESH_SECRET: 'test-refresh-secret-at-least-32-characters',
  ACCESS_TOKEN_TTL: '15m',
  REFRESH_TOKEN_TTL: '30d',
  APP_ENCRYPTION_KEY_V1: Buffer.alloc(32, 1).toString('base64'),
  ACTIVE_ENCRYPTION_KEY_VERSION: 1,
  API_KEY_PEPPER: 'test-api-key-pepper-at-least-32-characters',
  WEBHOOK_SECRET_ENCRYPTION_KEY: Buffer.alloc(32, 2).toString('base64'),
  DASHBOARD_ORIGIN: 'http://localhost:5173',
  LOG_LEVEL: 'silent',
};

export function validateEnvironment(
  input: Record<string, unknown>,
): Environment {
  const candidate =
    input.NODE_ENV === 'test' ? { ...testDefaults, ...input } : input;
  const result = environmentSchema.safeParse(candidate);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');

    throw new Error(`Invalid environment configuration: ${details}`);
  }

  return result.data;
}
