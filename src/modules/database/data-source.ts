import { join } from 'path';
import { DataSource } from 'typeorm';

import { loadEnvFiles } from '@/core/env-files.utility';

import { buildPostgresConnectionOptions } from './postgres-options.utility';
import { TYPEORM_ENTITIES } from './typeorm-entities';

const nodeEnv = process.env.NODE_ENV || 'development';

loadEnvFiles(join(__dirname, '../../env'), nodeEnv);

export default new DataSource({
  ...buildPostgresConnectionOptions({
    host: process.env.POSTGRES_HOST ?? '',
    port: Number(process.env.POSTGRES_PORT || 5432),
    username: process.env.POSTGRES_USER ?? '',
    password: process.env.POSTGRES_PASSWORD ?? '',
    database: process.env.DB_NAME ?? '',
    ssl: process.env.POSTGRES_SSL,
  }),
  entities: TYPEORM_ENTITIES,
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
});
