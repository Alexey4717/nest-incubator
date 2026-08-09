import { join } from 'path';

import { getEnvFilePaths } from './env-files.utility';

describe('getEnvFilePaths', () => {
  const originalEnvFilePath = process.env.ENV_FILE_PATH;

  afterEach(() => {
    if (originalEnvFilePath === undefined) {
      delete process.env.ENV_FILE_PATH;
    } else {
      process.env.ENV_FILE_PATH = originalEnvFilePath;
    }
  });

  it('returns env paths for given NODE_ENV without ENV_FILE_PATH', () => {
    delete process.env.ENV_FILE_PATH;
    const envDir = '/app/src/env';

    expect(getEnvFilePaths(envDir, 'testing')).toEqual([
      join(envDir, '.env.testing.local'),
      join(envDir, '.env.testing'),
      join(envDir, '.env.production'),
    ]);
  });

  it('prepends ENV_FILE_PATH when set', () => {
    process.env.ENV_FILE_PATH = '  /custom/.env  ';
    const envDir = '/app/src/env';

    expect(getEnvFilePaths(envDir, 'development')[0]).toBe('/custom/.env');
  });
});
