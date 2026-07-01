import { existsSync } from 'fs';
import { join } from 'path';

import * as moduleAlias from 'module-alias';

const distPath = join(__dirname, '..', 'dist');
const isRunningFromSrc = __dirname.replace(/\\/g, '/').endsWith('/src');

// Локально: node dist/main.js → __dirname = dist/
// Vercel: entry src/main.js, но runtime-модули лежат в dist/ после build
moduleAlias.addAlias('@', isRunningFromSrc && existsSync(distPath) ? distPath : __dirname);
