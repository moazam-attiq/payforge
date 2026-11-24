import { Test } from '@nestjs/testing';
import { DatabaseService } from '../../database/database.service';
import { RedisService } from '../../queue/redis.service';
import { HealthService } from './health.service';

describe('HealthService', () => {
  const checkDatabase = jest.fn();
  const checkRedis = jest.fn();
  let service: HealthService;

  beforeEach(async () => {
    checkDatabase.mockReset();
    checkRedis.mockReset();
    const moduleRef = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: DatabaseService,
          useValue: { checkConnection: checkDatabase },
        },
        {
          provide: RedisService,
          useValue: { checkConnection: checkRedis },
        },
      ],
    }).compile();

    service = moduleRef.get(HealthService);
  });

  it('reports ready only when both dependencies respond', async () => {
    checkDatabase.mockResolvedValue(undefined);
    checkRedis.mockResolvedValue(undefined);

    await expect(service.getReadiness()).resolves.toEqual({
      status: 'ready',
      dependencies: { postgres: 'ready', redis: 'ready' },
    });
  });

  it('reports each unavailable dependency without exposing errors', async () => {
    checkDatabase.mockRejectedValue(new Error('database connection details'));
    checkRedis.mockRejectedValue(new Error('redis connection details'));

    await expect(service.getReadiness()).resolves.toEqual({
      status: 'unavailable',
      dependencies: { postgres: 'unavailable', redis: 'unavailable' },
    });
  });
});
