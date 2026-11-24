import { Test } from '@nestjs/testing';
import type { Response } from 'express';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  const getReadiness = jest.fn();
  const setStatus = jest.fn();
  const response = { status: setStatus } as unknown as Response;
  let controller: HealthController;

  beforeEach(async () => {
    getReadiness.mockReset();
    setStatus.mockReset();
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: { getReadiness },
        },
      ],
    }).compile();

    controller = moduleRef.get(HealthController);
  });

  it('reports that the API process is live', () => {
    expect(controller.getLiveness()).toEqual({
      status: 'ok',
      service: 'payforge-api',
    });
  });

  it('returns dependency readiness when all dependencies are ready', async () => {
    const readiness = {
      status: 'ready',
      dependencies: { postgres: 'ready', redis: 'ready' },
    } as const;
    getReadiness.mockResolvedValue(readiness);

    await expect(controller.getReadiness(response)).resolves.toEqual(readiness);
    expect(setStatus).not.toHaveBeenCalled();
  });

  it('returns service unavailable without dependency error details', async () => {
    const readiness = {
      status: 'unavailable',
      dependencies: { postgres: 'unavailable', redis: 'ready' },
    } as const;
    getReadiness.mockResolvedValue(readiness);

    await expect(controller.getReadiness(response)).resolves.toEqual(readiness);
    expect(setStatus).toHaveBeenCalledWith(503);
  });
});
