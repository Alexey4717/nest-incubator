import { readFileSync } from 'fs';
import { join } from 'path';

import { DataSource } from 'typeorm';

import { loadEnvFiles } from '@/core/env-files.utility';

import { buildPostgresConnectionOptions } from '@/modules/database/postgres-options.utility';

import {
  AssertionResult,
  BenchmarkReport,
  BenchmarkScenarioConfig,
  ScaleMeasurement,
  ScalingRatio,
  ScenarioReport,
} from './benchmark.types';
import { isIndexScan, parseExplainJson } from './parse-explain';
import { BENCHMARK_IDS, cleanScenarioSeed, seedBenchmarkData } from './seed-bulk';

const BENCHMARK_DIR = join(__dirname, '../sql/benchmark');
const DEFAULT_SCALES = [100_000, 200_000, 400_000];
const QUICK_SCALES = [2_000, 4_000, 8_000];

const SCENARIOS: BenchmarkScenarioConfig[] = [
  {
    id: 'login',
    label: 'Login lookup (users.login)',
    sqlTemplate: 'login.sql',
    indexName: 'UQ_users_login',
    seedKind: 'users',
  },
  {
    id: 'posts-by-blog',
    label: 'Posts by blog (ORDER BY created_at)',
    sqlTemplate: 'posts-by-blog.sql',
    indexName: 'IDX_posts_blog_id_created_at',
    seedKind: 'posts',
  },
  {
    id: 'sessions-by-user',
    label: 'Sessions by user_id',
    sqlTemplate: 'sessions-by-user.sql',
    indexName: 'IDX_sessions_user_id',
    seedKind: 'sessions',
  },
];

function parseArgs(argv: string[]) {
  const quick = argv.includes('--quick');
  const scalesArg = argv.find((arg) => arg.startsWith('--scales='));

  return {
    quick,
    scales: scalesArg
      ? scalesArg
          .split('=')[1]
          .split(',')
          .map((value) => Number(value.trim()))
      : quick
        ? QUICK_SCALES
        : DEFAULT_SCALES,
  };
}

function renderSql(template: string, scale: number): string {
  const targetLogin = `bench_user_${String(Math.floor(scale / 2)).padStart(8, '0')}`;
  const params: Record<string, string> = {
    target_login: targetLogin,
    target_login_or_email: targetLogin,
    blog_id: BENCHMARK_IDS.blogId,
    post_id: BENCHMARK_IDS.targetPostId,
    user_id: BENCHMARK_IDS.targetUserId,
    blog_name: 'bench_blog',
    expired_before: new Date().toISOString(),
    limit: '20',
  };

  return Object.entries(params).reduce(
    (sql, [key, value]) => sql.replace(new RegExp(`\{\{${key}\}\}`, "g"), value),
    template,
  );
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
      poolMax: 5,
      connectionTimeoutMs: 60_000,
    }),
    entities: [],
    synchronize: false,
  });

  await dataSource.initialize();
  return dataSource;
}

async function runExplain(
  dataSource: DataSource,
  query: string,
  useIndex: boolean,
): Promise<ReturnType<typeof parseExplainJson>> {
  const runner = dataSource.createQueryRunner();
  await runner.connect();
  await runner.startTransaction();

  try {
    if (!useIndex) {
      await runner.query(`SET LOCAL enable_indexscan = off`);
      await runner.query(`SET LOCAL enable_bitmapscan = off`);
    }

    const raw = await runner.query(`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`);
    await runner.commitTransaction();
    return parseExplainJson(raw);
  } catch (error) {
    if (runner.isTransactionActive) {
      await runner.rollbackTransaction();
    }
    throw error;
  } finally {
    await runner.release();
  }
}

function computeScalingRatios(measurements: ScaleMeasurement[]): ScalingRatio[] {
  const ratios: ScalingRatio[] = [];

  for (let i = 1; i < measurements.length; i += 1) {
    const prev = measurements[i - 1];
    const curr = measurements[i];

    ratios.push({
      fromScale: prev.scale,
      toScale: curr.scale,
      withIndexRatio: curr.withIndex.executionTimeMs / prev.withIndex.executionTimeMs,
      withoutIndexRatio: curr.withoutIndex.executionTimeMs / prev.withoutIndex.executionTimeMs,
    });
  }

  return ratios;
}

function assertScenario(report: ScenarioReport): AssertionResult[] {
  const assertions: AssertionResult[] = [];
  const maxMeasurement = report.measurements[report.measurements.length - 1];

  assertions.push({
    name: 'index-scan-at-max-scale',
    passed: isIndexScan(maxMeasurement.withIndex.scanType),
    message: `Expected Index Scan at max scale, got ${maxMeasurement.withIndex.scanType}`,
  });

  assertions.push({
    name: 'seq-scan-without-index-at-max-scale',
    passed: maxMeasurement.withoutIndex.scanType === 'Seq Scan',
    message: `Expected Seq Scan without index, got ${maxMeasurement.withoutIndex.scanType}`,
  });

  const speedup =
    maxMeasurement.withoutIndex.executionTimeMs / Math.max(maxMeasurement.withIndex.executionTimeMs, 0.001);

  assertions.push({
    name: 'speedup-at-max-scale',
    passed: speedup >= 10,
    message: `Expected speedup >= 10x, got ${speedup.toFixed(1)}x`,
  });

  for (const ratio of report.scalingRatios) {
    assertions.push({
      name: `linear-scaling-without-index-${ratio.fromScale}-${ratio.toScale}`,
      passed: ratio.withoutIndexRatio >= 1.8 && ratio.withoutIndexRatio <= 2.5,
      message: `Expected T(2N)/T(N) ~ 2.0 without index, got ${ratio.withoutIndexRatio.toFixed(2)} (${ratio.fromScale}→${ratio.toScale})`,
    });

    assertions.push({
      name: `log-scaling-with-index-${ratio.fromScale}-${ratio.toScale}`,
      passed: ratio.withIndexRatio >= 1.0 && ratio.withIndexRatio <= 1.3,
      message: `Expected T(2N)/T(N) ~ 1.0–1.3 with index, got ${ratio.withIndexRatio.toFixed(2)} (${ratio.fromScale}→${ratio.toScale})`,
    });
  }

  return assertions;
}

function printReport(report: BenchmarkReport): void {
  console.log('\n=== PostgreSQL Index Benchmark Report ===\n');

  for (const scenario of report.scenarios) {
    console.log(`Scenario: ${scenario.scenario.label}`);
    console.log(
      '| Scale | With index (ms) | Scan | Without index (ms) | Scan | Speedup |',
    );
    console.log('|------:|----------------:|------|-------------------:|------|--------:|');

    for (const row of scenario.measurements) {
      const speedup = row.withoutIndex.executionTimeMs / Math.max(row.withIndex.executionTimeMs, 0.001);
      console.log(
        `| ${row.scale.toLocaleString()} | ${row.withIndex.executionTimeMs.toFixed(2)} | ${row.withIndex.scanType} | ${row.withoutIndex.executionTimeMs.toFixed(2)} | ${row.withoutIndex.scanType} | ${speedup.toFixed(1)}x |`,
      );
    }

    console.log('\nScaling ratios T(2N)/T(N):');
    for (const ratio of scenario.scalingRatios) {
      console.log(
        `  ${ratio.fromScale} → ${ratio.toScale}: with index ${ratio.withIndexRatio.toFixed(2)}, without index ${ratio.withoutIndexRatio.toFixed(2)}`,
      );
    }

    console.log('\nAssertions:');
    for (const assertion of scenario.assertions) {
      console.log(`  ${assertion.passed ? '✓' : '✗'} ${assertion.name}: ${assertion.message}`);
    }

    console.log('');
  }

  console.log(report.allPassed ? 'All assertions passed.' : 'Some assertions FAILED.');
}

async function runScenario(
  dataSource: DataSource,
  scenario: BenchmarkScenarioConfig,
  scales: number[],
): Promise<ScenarioReport> {
  const template = readFileSync(join(BENCHMARK_DIR, scenario.sqlTemplate), 'utf8');
  const measurements: ScaleMeasurement[] = [];

  for (const scale of scales) {
    console.log(`  [${scenario.id}] seeding ${scale.toLocaleString()} rows…`);
    await cleanScenarioSeed(dataSource, scenario.seedKind);
    await seedBenchmarkData(dataSource, scale, scenario.seedKind);
    await dataSource.query(`ANALYZE`);

    const query = renderSql(template, scale);
    const withIndex = await runExplain(dataSource, query, true);
    const withoutIndex = await runExplain(dataSource, query, false);

    measurements.push({ scale, withIndex, withoutIndex });
  }

  const scalingRatios = computeScalingRatios(measurements);
  const max = measurements[measurements.length - 1];
  const maxScaleSpeedup =
    max.withoutIndex.executionTimeMs / Math.max(max.withIndex.executionTimeMs, 0.001);

  const partialReport: ScenarioReport = {
    scenario,
    measurements,
    scalingRatios,
    maxScaleSpeedup,
    assertions: [],
  };

  partialReport.assertions = assertScenario(partialReport);
  return partialReport;
}

async function bootstrap(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const dataSource = await createDataSource();

  try {
    console.log(`Running benchmark (scales: ${args.scales.join(', ')})…`);

    const scenarios: ScenarioReport[] = [];
    for (const scenario of SCENARIOS) {
      console.log(`\nScenario: ${scenario.label}`);
      scenarios.push(await runScenario(dataSource, scenario, args.scales));
    }

    const report: BenchmarkReport = {
      scales: args.scales,
      scenarios,
      allPassed: scenarios.every((item) => item.assertions.every((assertion) => assertion.passed)),
    };

    printReport(report);
    process.exit(report.allPassed ? 0 : 1);
  } finally {
    await dataSource.destroy();
  }
}

bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
