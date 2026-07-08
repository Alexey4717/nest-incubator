import { TlsOptions } from 'tls';

export function resolvePostgresSsl(value: string | boolean | undefined): boolean | TlsOptions {
  if (value === true || value === 'true' || value === '1') {
    return { rejectUnauthorized: false };
  }

  return false;
}

export function buildPostgresConnectionOptions(config: {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl?: string | boolean;
}) {
  return {
    type: 'postgres' as const,
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    database: config.database,
    ssl: resolvePostgresSsl(config.ssl),
  };
}
