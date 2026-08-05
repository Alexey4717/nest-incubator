import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

import { DataSource } from 'typeorm';

import { loadEnvFiles } from '@/core/env-files.utility';

import { buildPostgresConnectionOptions } from '@/modules/database/postgres-options.utility';

const AUDIT_DIR = join(__dirname, '../sql/audit');

const SECTION_TITLES: Record<string, string> = {
  '01-unused-indexes.sql': 'Неиспользуемые индексы (лекция §5)',
  '02-duplicate-indexes.sql': 'Дублирующие индексы (лекция §4)',
  '03-missing-fk-indexes.sql': 'FK-колонки без индекса (лекция §3)',
  '04-small-tables-with-indexes.sql': 'Малые таблицы с индексами (лекция §1)',
};

type AuditRow = Record<string, unknown>;

type AuditSection = {
  file: string;
  title: string;
  rows: AuditRow[];
  error?: string;
};

function parseArgs(argv: string[]) {
  return {
    json: argv.includes('--json'),
  };
}

async function createDataSource(): Promise<DataSource> {
  const nodeEnv = process.env.NODE_ENV || 'development';
  loadEnvFiles(join(__dirname, '../../src/env'), nodeEnv);

  const dataSource = new DataSource({
    ...buildPostgresConnectionOptions({
      host: process.env.POSTGRES_HOST ?? '',
      port: Number(process.env.POSTGRES_PORT || 5432),
      username: process.env.POSTGRES_USER ?? '',
      password: process.env.POSTGRES_PASSWORD ?? '',
      database: process.env.DB_NAME ?? '',
      ssl: process.env.POSTGRES_SSL,
    }),
    entities: [],
    synchronize: false,
  });

  await dataSource.initialize();
  return dataSource;
}

function listAuditFiles(): string[] {
  return readdirSync(AUDIT_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (Array.isArray(value)) {
    return `{${value.map(String).join(', ')}}`;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}

function renderTable(rows: AuditRow[]): string {
  if (rows.length === 0) {
    return 'no issues found';
  }

  const columns = Object.keys(rows[0]);
  const widths = columns.map((column) =>
    Math.max(column.length, ...rows.map((row) => formatCell(row[column]).length)),
  );

  const header = columns.map((column, index) => column.padEnd(widths[index])).join(' | ');
  const separator = widths.map((width) => '-'.repeat(width)).join('-|-');
  const body = rows
    .map((row) => columns.map((column, index) => formatCell(row[column]).padEnd(widths[index])).join(' | '))
    .join('\n');

  return `${header}\n${separator}\n${body}`;
}

function renderTextReport(sections: AuditSection[]): string {
  const lines = ['# Index audit report', ''];

  for (const section of sections) {
    lines.push(`## ${section.title}`);
    lines.push('');

    if (section.error) {
      lines.push(`Error: ${section.error}`);
    } else {
      lines.push(renderTable(section.rows));
    }

    lines.push('');
  }

  return lines.join('\n');
}

async function runAudit(dataSource: DataSource): Promise<AuditSection[]> {
  const sections: AuditSection[] = [];

  for (const file of listAuditFiles()) {
    const title = SECTION_TITLES[file] ?? file;
    const sql = readFileSync(join(AUDIT_DIR, file), 'utf8').trim();

    try {
      const rows = (await dataSource.query(sql)) as AuditRow[];
      sections.push({ file, title, rows });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      sections.push({ file, title, rows: [], error: message });
    }
  }

  return sections;
}

async function bootstrap(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const dataSource = await createDataSource();

  try {
    const sections = await runAudit(dataSource);

    if (args.json) {
      console.log(JSON.stringify({ sections }, null, 2));
    } else {
      console.log(renderTextReport(sections));
    }
  } finally {
    await dataSource.destroy();
  }
}

bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exit(0);
});
