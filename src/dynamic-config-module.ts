import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

import { getEnvFilePaths } from '@/shared/core/env-files.utility';

export const configModule = ConfigModule.forRoot({
  envFilePath: getEnvFilePaths(join(__dirname, 'env')),
  isGlobal: true,
});
