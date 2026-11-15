// Check a guide file for geometry and count problems.
// Run: node scripts/check-guide.mjs [--fix] web/public/examples/bookcase.json [more.json ...]
// --fix also tries the automatic corrections (web/src/autofix.js) and lists them; files are not changed.
import { readFileSync } from 'node:fs';
import { normalizeGuide } from '../web/src/guide.js';
import { checkGuide } from '../web/src/check.js';
import { autoFix } from '../web/src/autofix.js';

let bad = 0;
const fix = process.argv.includes('--fix');
for (const file of process.argv.slice(2).filter(a => a !== '--fix')) {
  const g = normalizeGuide(JSON.parse(readFileSync(file, 'utf8')));
  const r = fix ? autoFix(g) : null, issues = r ? r.issues : checkGuide(g);
  console.log(`\n${file}: ${issues.length ? '' : 'no problems found'}`);
  for (const f of r?.fixes || []) console.log(`  fixed ${f}`);
  for (const i of issues) console.log(`  ${i.level.padEnd(5)} ${i.step ? `step ${i.step}` : 'guide '.padEnd(6)}  ${i.code.padEnd(14)} ${i.msg}${i.count > 1 ? ` (×${i.count})` : ''}`);
  bad += issues.filter(i => i.level === 'error').length;
}
process.exit(bad ? 1 : 0);
