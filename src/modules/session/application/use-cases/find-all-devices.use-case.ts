import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/core/types/use-case';

import { SessionQueryRepository } from '../../infrastructure/session-query.repository';
import { SessionViewModel } from '../../models/session-view.model';

@Injectable()
export class FindAllDevicesUseCase implements IUseCase<string, SessionViewModel[]> {
  constructor(private readonly sessionQueryRepository: SessionQueryRepository) {}

  execute(userId: string): Promise<SessionViewModel[]> {
    return this.sessionQueryRepository.findAllDevicesByUserId(userId);
  }
}
