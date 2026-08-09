import { ApiProperty } from '@nestjs/swagger';

export class SecurityDeviceViewDto {
  @ApiProperty({ example: '127.0.0.1' })
  ip = '';

  @ApiProperty({ example: 'Chrome' })
  title = '';

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  lastActiveDate = '';

  @ApiProperty({ example: 'uuid' })
  deviceId = '';
}
