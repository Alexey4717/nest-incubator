const { spawnSync } = require('node:child_process');
const path = require('node:path');

const name = process.argv[2];

if (!name) {
  console.error('');
  console.error('Usage: yarn migration:generate <MigrationName>');
  console.error('');
  console.error('Example:');
  console.error('  yarn migration:generate AddUserIndex');
  console.error('');
  console.error('Creates: src/modules/database/migrations/<timestamp>-<MigrationName>.ts');
  process.exit(1);
}

const migrationPath = path.join('src', 'modules', 'database', 'migrations', name);

const result = spawnSync(
  process.execPath,
  [
    '-r',
    'tsconfig-paths/register',
    './node_modules/typeorm/cli-ts-node-commonjs.js',
    '-d',
    'src/modules/database/data-source.ts',
    'migration:generate',
    migrationPath,
  ],
  { stdio: 'inherit', cwd: process.cwd() },
);

process.exit(result.status ?? 1);
