import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { DatabaseService } from './../src/database/database.service';
import { RedisService } from './../src/queue/redis.service';

@Controller('_test')
class TestErrorController {
  @Get('unexpected')
  throwUnexpectedError(): never {
    throw new Error('sensitive database details');
  }
}

describe('Health (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [TestErrorController],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health/live (GET)', () => {
    return request(app.getHttpServer())
      .get('/health/live')
      .expect(200)
      .expect({ status: 'ok', service: 'payforge-api' });
  });

  it('/health/ready (GET) returns 200 when dependencies are ready', () => {
    jest
      .spyOn(app.get(DatabaseService), 'checkConnection')
      .mockResolvedValue(undefined);
    jest
      .spyOn(app.get(RedisService), 'checkConnection')
      .mockResolvedValue(undefined);

    return request(app.getHttpServer())
      .get('/health/ready')
      .expect(200)
      .expect({
        status: 'ready',
        dependencies: { postgres: 'ready', redis: 'ready' },
      });
  });

  it('/health/ready (GET) returns 503 with safe dependency states', () => {
    jest
      .spyOn(app.get(DatabaseService), 'checkConnection')
      .mockRejectedValue(new Error('sensitive database details'));
    jest
      .spyOn(app.get(RedisService), 'checkConnection')
      .mockRejectedValue(new Error('sensitive redis details'));

    return request(app.getHttpServer())
      .get('/health/ready')
      .expect(503)
      .expect({
        status: 'unavailable',
        dependencies: { postgres: 'unavailable', redis: 'unavailable' },
      });
  });

  it('returns a generated request ID', async () => {
    const response = await request(app.getHttpServer()).get('/health/live');

    expect(response.headers['x-request-id']).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('preserves a safe incoming request ID', async () => {
    const response = await request(app.getHttpServer())
      .get('/health/live')
      .set('x-request-id', 'merchant-request_123');

    expect(response.headers['x-request-id']).toBe('merchant-request_123');
  });

  it('replaces an unsafe incoming request ID', async () => {
    const response = await request(app.getHttpServer())
      .get('/health/live')
      .set('x-request-id', 'contains spaces');

    expect(response.headers['x-request-id']).not.toBe('contains spaces');
    expect(response.headers['x-request-id']).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('returns a stable safe error for unknown routes', async () => {
    const response = await request(app.getHttpServer())
      .get('/does-not-exist')
      .set('x-request-id', 'missing-route-request');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        type: 'invalid_request_error',
        code: 'not_found',
        message: 'The requested resource was not found.',
        requestId: 'missing-route-request',
      },
    });
  });

  it('does not expose unexpected error details', async () => {
    const response = await request(app.getHttpServer())
      .get('/_test/unexpected')
      .set('x-request-id', 'unexpected-error-request');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: {
        type: 'api_error',
        code: 'internal_error',
        message: 'An unexpected error occurred.',
        requestId: 'unexpected-error-request',
      },
    });
    expect(JSON.stringify(response.body)).not.toContain(
      'sensitive database details',
    );
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await app.close();
  });
});
