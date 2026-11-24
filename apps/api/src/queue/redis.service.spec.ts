import { ConfigService } from '@nestjs/config';
import { Environment } from '../config/environment';
import { RedisService } from './redis.service';

describe('RedisService', () => {
  it('does not connect during construction', () => {
    const config = new ConfigService<Environment, true>({
      REDIS_URL: 'redis://localhost:6379',
    });
    const service = new RedisService(config);

    expect(service.client.status).toBe('wait');

    service.onModuleDestroy();
    expect(service.client.status).toBe('end');
  });
});
