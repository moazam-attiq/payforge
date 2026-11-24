import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import type { LivenessResponse, ReadinessResponse } from '@payforge/contracts';
import type { Response } from 'express';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('live')
  getLiveness(): LivenessResponse {
    return {
      status: 'ok',
      service: 'payforge-api',
    };
  }

  @Get('ready')
  async getReadiness(
    @Res({ passthrough: true }) response: Response,
  ): Promise<ReadinessResponse> {
    const readiness = await this.healthService.getReadiness();

    if (readiness.status === 'unavailable') {
      response.status(HttpStatus.SERVICE_UNAVAILABLE);
    }

    return readiness;
  }
}
