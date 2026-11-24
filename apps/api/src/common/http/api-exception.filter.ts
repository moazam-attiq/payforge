import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { ApiErrorResponse } from '@payforge/contracts';
import { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { REQUEST_ID_HEADER, resolveRequestId } from '../logging/logging';

type ErrorDescriptor = Pick<
  ApiErrorResponse['error'],
  'type' | 'code' | 'message'
>;

const errorByStatus: Partial<Record<number, ErrorDescriptor>> = {
  [HttpStatus.BAD_REQUEST]: {
    type: 'invalid_request_error',
    code: 'bad_request',
    message: 'The request is invalid.',
  },
  [HttpStatus.UNAUTHORIZED]: {
    type: 'authentication_error',
    code: 'unauthorized',
    message: 'Authentication is required.',
  },
  [HttpStatus.FORBIDDEN]: {
    type: 'authorization_error',
    code: 'forbidden',
    message: 'You are not allowed to perform this action.',
  },
  [HttpStatus.NOT_FOUND]: {
    type: 'invalid_request_error',
    code: 'not_found',
    message: 'The requested resource was not found.',
  },
  [HttpStatus.CONFLICT]: {
    type: 'conflict_error',
    code: 'conflict',
    message: 'The request conflicts with the current resource state.',
  },
  [HttpStatus.UNPROCESSABLE_ENTITY]: {
    type: 'invalid_request_error',
    code: 'unprocessable_entity',
    message: 'The request could not be processed.',
  },
  [HttpStatus.TOO_MANY_REQUESTS]: {
    type: 'rate_limit_error',
    code: 'rate_limit_exceeded',
    message: 'Too many requests.',
  },
  [HttpStatus.SERVICE_UNAVAILABLE]: {
    type: 'api_error',
    code: 'service_unavailable',
    message: 'The service is temporarily unavailable.',
  },
};

const internalError: ErrorDescriptor = {
  type: 'api_error',
  code: 'internal_error',
  message: 'An unexpected error occurred.',
};

function getRequestId(request: Request, response: Response): string {
  const responseRequestId = response.getHeader(REQUEST_ID_HEADER);

  if (typeof responseRequestId === 'string') {
    return responseRequestId;
  }

  return resolveRequestId(request.headers[REQUEST_ID_HEADER]);
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(ApiExceptionFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const descriptor = errorByStatus[status] ?? internalError;
    const requestId = getRequestId(request, response);

    if (status >= 500) {
      this.logger.error(
        {
          requestId,
          exceptionType:
            exception instanceof Error
              ? exception.constructor.name
              : 'UnknownException',
        },
        'Request failed unexpectedly',
      );
    }

    const body: ApiErrorResponse = {
      error: {
        ...descriptor,
        requestId,
      },
    };

    response.status(status).json(body);
  }
}
