import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { QueueInfrastructureModule } from '../../queue/queue-infrastructure.module';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [DatabaseModule, QueueInfrastructureModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
