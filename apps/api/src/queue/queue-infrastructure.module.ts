import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment } from '../config/environment';
import { RedisService } from './redis.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Environment, true>) => ({
        prefix: 'payforge',
        connection: {
          url: config.getOrThrow('REDIS_URL'),
          lazyConnect: true,
          enableReadyCheck: true,
          connectTimeout: 3_000,
          maxRetriesPerRequest: 1,
        },
      }),
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class QueueInfrastructureModule {}
