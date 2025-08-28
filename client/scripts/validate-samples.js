// validate-samples.js (ESM)
// Tüm örnek JSON'ları (docs/samples/ipc|services/*.sample.json) ilgili şemalara (docs/schemas/...) karşı doğrular.
import { promises as fs } from 'fs';
import path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

function schemaPathForSample(samplesRoot, schemasRoot, samplePath) {
  const rel = path.relative(samplesRoot, samplePath);
  const parts = rel.split(path.sep);
  if (parts.length < 2) return null;
  const top = parts[0];
  if (top !== 'ipc' && top !== 'services') return null;
  const base = parts[parts.length - 1];
  if (!base.endsWith('.sample.json')) return null;
  const name = base.replace(/\.sample\.json$/, '');
  const schemaRel = path.join(...parts.slice(0, -1), `${name}.schema.json`);
  return path.join(schemasRoot, schemaRel);
}

async function main() {
  const cwd = process.cwd();
  const samplesRoot = path.resolve(cwd, '..', 'docs', 'samples');
  const schemasRoot = path.resolve(cwd, '..', 'docs', 'schemas');

  const allFiles = await walk(samplesRoot);
  const sampleFiles = allFiles.filter(
    p =>
      p.endsWith('.sample.json') &&
      (p.includes(`${path.sep}ipc${path.sep}`) ||
        p.includes(`${path.sep}services${path.sep}`))
  );

  let failed = 0;
  let validated = 0;

  for (const sample of sampleFiles) {
    const schemaPath = schemaPathForSample(samplesRoot, schemasRoot, sample);
    if (!schemaPath) {
      // örnek eşleştirilemedi, atla
      continue;
    }
    if (!(await fileExists(schemaPath))) {
      console.warn(`[SKIP] Şema bulunamadı: ${schemaPath} (örnek: ${sample})`);
      continue;
    }
    try {
      const [schemaRaw, dataRaw] = await Promise.all([
        fs.readFile(schemaPath, 'utf8'),
        fs.readFile(sample, 'utf8'),
      ]);
      const schema = JSON.parse(schemaRaw);
      const data = JSON.parse(dataRaw);
      const validate = ajv.compile(schema);
      const ok = validate(data);
      if (!ok) {
        failed++;
        console.error(
          `\n[FAIL] ${path.relative(samplesRoot, sample)} → ${path.relative(schemasRoot, schemaPath)}`
        );
        for (const err of validate.errors ?? []) {
          console.error(`  - ${err.instancePath || '(root)'} ${err.message}`);
        }
      } else {
        validated++;
        // success (sessiz geç)
      }
    } catch (e) {
      failed++;
      console.error(`\n[ERROR] ${sample}: ${(e && e.message) || e}`);
    }
  }

  console.log(
    `\nTamamlandı: ${validated + failed} örnek doğrulandı → Başarılı: ${validated}, Hatalı: ${failed}`
  );
  if (failed > 0) process.exit(1);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
