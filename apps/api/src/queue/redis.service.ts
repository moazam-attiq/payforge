import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { Environment } from '../config/environment';

@Injectable()
export class RedisService implements OnModuleDestroy {
  readonly client: Redis;

  constructor(config: ConfigService<Environment, true>) {
    this.client = new Redis(config.getOrThrow('REDIS_URL'), {
      lazyConnect: true,
      enableReadyCheck: true,
      connectTimeout: 3_000,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
    });

    // ioredis requires an error listener; command callers still receive errors.
    this.client.on('error', () => undefined);
  }

  async checkConnection(): Promise<void> {
    if (this.client.status === 'wait' || this.client.status === 'end') {
      await this.client.connect();
    }

    await this.client.ping();
  }

  onModuleDestroy(): void {
    this.client.disconnect();
  }
}
