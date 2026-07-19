import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

import { getEnvFilePaths } from '@/core/env-files.utility';

export const configModule = ConfigModule.forRoot({
  envFilePath: getEnvFilePaths(join(__dirname, 'env')),
  isGlobal: true,
});
