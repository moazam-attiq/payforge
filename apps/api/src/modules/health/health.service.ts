import { Injectable } from '@nestjs/common';
import type { ReadinessResponse } from '@payforge/contracts';
import { DatabaseService } from '../../database/database.service';
import { RedisService } from '../../queue/redis.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly database: DatabaseService,
    private readonly redis: RedisService,
  ) {}

  async getReadiness(): Promise<ReadinessResponse> {
    const [postgres, redis] = await Promise.allSettled([
      this.database.checkConnection(),
      this.redis.checkConnection(),
    ]);
    const postgresStatus =
      postgres.status === 'fulfilled' ? 'ready' : 'unavailable';
    const redisStatus = redis.status === 'fulfilled' ? 'ready' : 'unavailable';

    return {
      status:
        postgresStatus === 'ready' && redisStatus === 'ready'
          ? 'ready'
          : 'unavailable',
      dependencies: {
        postgres: postgresStatus,
        redis: redisStatus,
      },
    };
  }
}
