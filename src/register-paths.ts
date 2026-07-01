import { existsSync } from 'fs';
import * as moduleAlias from 'module-alias';
import { join } from 'path';

const distPath = join(__dirname, '..', 'dist');
const isRunningFromSrc = __dirname.replace(/\\/g, '/').endsWith('/src');

// Локально: node dist/main.js → __dirname = dist/
// Vercel: entry src/main.js, но runtime-модули лежат в dist/ после build
moduleAlias.addAlias('@', isRunningFromSrc && existsSync(distPath) ? distPath : __dirname);
