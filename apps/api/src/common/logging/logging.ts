import { randomUUID } from 'node:crypto';
import { IncomingMessage, ServerResponse } from 'node:http';
import { Params } from 'nestjs-pino';
import { Environment } from '../../config/environment';

export const REQUEST_ID_HEADER = 'x-request-id';
export const REDACTED_VALUE = '[REDACTED]';

export const LOGGER_REDACTION = {
  censor: REDACTED_VALUE,
  paths: [
    'req.headers.authorization',
    'req.headers.cookie',
    'req.headers["x-api-key"]',
    'req.headers["x-webhook-secret"]',
    'req.body.password',
    'req.body.passwordHash',
    'req.body.accessToken',
    'req.body.refreshToken',
    'req.body.apiKey',
    'req.body.apiKeySecret',
    'req.body.clientSecret',
    'req.body.webhookSecret',
    'req.body.email',
    'req.body.phone',
    'req.body.name',
    'req.body.pan',
    'req.body.cvv',
    'password',
    'passwordHash',
    'accessToken',
    'refreshToken',
    'apiKey',
    'apiKeySecret',
    'clientSecret',
    'webhookSecret',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'APP_ENCRYPTION_KEY_V1',
    'API_KEY_PEPPER',
    'WEBHOOK_SECRET_ENCRYPTION_KEY',
    'config.JWT_ACCESS_SECRET',
    'config.JWT_REFRESH_SECRET',
    'config.APP_ENCRYPTION_KEY_V1',
    'config.API_KEY_PEPPER',
    'config.WEBHOOK_SECRET_ENCRYPTION_KEY',
  ],
};

const requestIdPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

export function resolveRequestId(
  value: string | string[] | undefined,
  createId: () => string = randomUUID,
): string {
  if (typeof value === 'string' && requestIdPattern.test(value)) {
    return value;
  }

  return createId();
}

function getPathname(url: string | undefined): string | undefined {
  if (!url) {
    return undefined;
  }

  return new URL(url, 'http://localhost').pathname;
}

export function createLoggerParams(
  nodeEnvironment: Environment['NODE_ENV'],
  level: Environment['LOG_LEVEL'],
): Params {
  return {
    pinoHttp: {
      level,
      redact: LOGGER_REDACTION,
      transport:
        nodeEnvironment === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                ignore: 'pid,hostname',
                singleLine: true,
                translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
              },
            }
          : undefined,
      customAttributeKeys: {
        reqId: 'requestId',
      },
      genReqId: (request: IncomingMessage, response: ServerResponse) => {
        const requestId = resolveRequestId(request.headers[REQUEST_ID_HEADER]);

        response.setHeader(REQUEST_ID_HEADER, requestId);

        return requestId;
      },
      serializers: {
        req: (request: IncomingMessage) => ({
          id: request.id,
          method: request.method,
          path: getPathname(request.url),
        }),
        res: (response: ServerResponse) => ({
          statusCode: response.statusCode,
        }),
      },
    },
  };
}
