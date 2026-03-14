import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import getServer from '../src/server.ts';

const app = await getServer();
await app.ready();

const yaml = app.swagger({ yaml: true });
const outputPath = resolve(import.meta.dirname, '..', 'openapi.yaml');
writeFileSync(outputPath, yaml);

console.log(`OpenAPI spec written to ${outputPath}`);

await app.close();
