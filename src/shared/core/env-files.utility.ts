import { config } from 'dotenv';
import { join } from 'path';

export function getEnvFilePaths(envDir: string, nodeEnv?: string): string[] {
  const env = nodeEnv ?? process.env.NODE_ENV;

  return [
    process.env.ENV_FILE_PATH?.trim(),
    join(envDir, `.env.${env}.local`),
    join(envDir, `.env.${env}`),
    join(envDir, '.env.production'),
  ].filter((path): path is string => Boolean(path));
}

export function loadEnvFiles(envDir: string, nodeEnv?: string): void {
  getEnvFilePaths(envDir, nodeEnv).forEach((path) => config({ path }));
}
