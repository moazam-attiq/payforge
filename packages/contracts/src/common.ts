import { z } from 'zod';

export const requestIdSchema = z
  .string()
  .regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/);

export const currencyCodeSchema = z
  .string()
  .regex(/^[a-z]{3}$/, 'must be a lowercase three-letter currency code');

export const moneySchema = z
  .object({
    amount: z.number().int().nonnegative(),
    currency: currencyCodeSchema,
  })
  .strict();

export const apiErrorResponseSchema = z
  .object({
    error: z
      .object({
        type: z.string().min(1),
        code: z.string().min(1),
        message: z.string().min(1),
        requestId: requestIdSchema,
      })
      .strict(),
  })
  .strict();

export const livenessResponseSchema = z
  .object({
    status: z.literal('ok'),
    service: z.literal('payforge-api'),
  })
  .strict();

const dependencyStatusSchema = z.enum(['ready', 'unavailable']);

export const readinessResponseSchema = z
  .object({
    status: dependencyStatusSchema,
    dependencies: z
      .object({
        postgres: dependencyStatusSchema,
        redis: dependencyStatusSchema,
      })
      .strict(),
  })
  .strict();

export type Money = z.infer<typeof moneySchema>;
export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
export type LivenessResponse = z.infer<typeof livenessResponseSchema>;
export type ReadinessResponse = z.infer<typeof readinessResponseSchema>;
