/**
 * Validates the exported audit datasets in `data/` against the JSON Schemas
 * emitted from `@raybot/object-model`.
 *
 * This is the gate that keeps the model honest. The datasets are produced by
 * `scripts/export-wiki-data.ps1` from the source audit repository; the schemas
 * are produced from the TypeScript types. If either side drifts, this fails.
 *
 * Run: npm run validate-data
 */
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG = resolve(HERE, '..');
const REPO = resolve(PKG, '..', '..');
const SCHEMAS = join(PKG, 'schemas');
const DATA = join(REPO, 'data');

/**
 * dataset file -> [schema type, shape]
 *
 * `array` means the file is a JSON array whose every member must satisfy the
 * schema. `object` means the file is a single instance.
 */
const BINDINGS = [
  ['surfaces.json', 'CoralSurface', 'array'],
  ['elements.json', 'CoralElement', 'array'],
  ['testids.json', 'CoralTestId', 'array'],
  ['api-hosts.json', 'ApiHost', 'array'],
  ['api-endpoints.json', 'ApiEndpoint', 'array'],
  ['audit-totals.json', 'AuditTotals', 'object'],
  ['evalset.json', 'EvalTestCase', 'array'],
];

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));

let failures = 0;
let checked = 0;

for (const [file, type, shape] of BINDINGS) {
  const dataPath = join(DATA, file);
  const schemaPath = join(SCHEMAS, `${type}.schema.json`);

  if (!existsSync(schemaPath)) {
    console.error(`MISSING SCHEMA ${type} - run npm run schemas first`);
    failures += 1;
    continue;
  }
  if (!existsSync(dataPath)) {
    console.error(`MISSING DATA ${file}`);
    failures += 1;
    continue;
  }

  const validate = ajv.compile(readJson(schemaPath));
  const data = readJson(dataPath);
  const rows = shape === 'array' ? data : [data];

  if (shape === 'array' && !Array.isArray(data)) {
    console.error(`SHAPE ${file} expected an array`);
    failures += 1;
    continue;
  }

  let bad = 0;
  for (let i = 0; i < rows.length; i += 1) {
    if (!validate(rows[i])) {
      if (bad < 3) {
        const where = shape === 'array' ? `[${i}]` : '';
        console.error(
          `INVALID ${file}${where} against ${type}: ` +
            validate.errors
              .map((e) => `${e.instancePath || '/'} ${e.message}`)
              .join('; '),
        );
      }
      bad += 1;
    }
  }

  checked += rows.length;
  if (bad > 0) {
    console.error(`FAIL ${file}: ${bad} of ${rows.length} rows invalid against ${type}`);
    failures += 1;
  } else {
    console.log(`ok   ${file.padEnd(20)} ${String(rows.length).padStart(5)} x ${type}`);
  }
}

if (failures > 0) {
  console.error(`\nvalidate-data FAILED: ${failures} dataset(s) invalid`);
  process.exit(1);
}

console.log(`\nvalidate-data OK: ${BINDINGS.length} datasets, ${checked} records`);
