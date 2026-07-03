import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { AuthModule } from '@/modules/auth/auth.module';
import { SessionModule } from '@/modules/session/session.module';

import { SecurityController } from './api/security.controller';
import { TerminateDeviceHandler } from './application/commands/terminate-device.command';
import { TerminateOtherDevicesHandler } from './application/commands/terminate-other-devices.command';
import { GetDevicesHandler } from './application/queries/get-devices.query';
import { GetDevicesUseCase } from './application/use-cases/get-devices.use-case';
import { TerminateDeviceUseCase } from './application/use-cases/terminate-device.use-case';
import { TerminateOtherDevicesUseCase } from './application/use-cases/terminate-other-devices.use-case';

const securityUseCases = [GetDevicesUseCase, TerminateDeviceUseCase, TerminateOtherDevicesUseCase];

const securityCommandHandlers = [TerminateDeviceHandler, TerminateOtherDevicesHandler];

const securityQueryHandlers = [GetDevicesHandler];

@Module({
  imports: [CqrsModule, AuthModule, SessionModule],
  controllers: [SecurityController],
  providers: [...securityUseCases, ...securityCommandHandlers, ...securityQueryHandlers],
})
export class SecurityModule {}
