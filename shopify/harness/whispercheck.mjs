// Checks Naira's Whisper templates against the schemas they will run under,
// before anything is uploaded: every section and block type exists, every
// setting id is in that schema, every select / radio value is one of its
// options, and every range value is inside its bounds. A template Shopify
// would reject, or would quietly render with a default, fails here first.
//   node whispercheck.mjs <horizonDir> <whisperDir>
// The theme's own blocks and sections are read from <whisperDir> first and
// then from the Horizon source, which Whisper 3.5.1 is file-for-file.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const [HORIZON, WHISPER] = process.argv.slice(2);
if (!HORIZON || !WHISPER) {
  console.error('usage: node whispercheck.mjs <horizonDir> <whisperDir>');
  process.exit(2);
}

const stripComment = (text) => text.slice(text.indexOf('{'));
const schemaOf = (kind, type) => {
  for (const root of [WHISPER, HORIZON]) {
    const file = join(root, kind, `${type}.liquid`);
    if (!existsSync(file)) continue;
    const src = readFileSync(file, 'utf8');
    const match = src.match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/);
    return match ? JSON.parse(match[1]) : {};
  }
  return null;
};

const problems = [];
const checkSettings = (where, schema, settings = {}) => {
  const defs = Object.fromEntries((schema.settings || []).filter((s) => s.id).map((s) => [s.id, s]));
  for (const [id, value] of Object.entries(settings)) {
    const def = defs[id];
    if (!def) {
      problems.push(`${where}: unknown setting "${id}"`);
      continue;
    }
    if ((def.type === 'select' || def.type === 'radio') && def.options && typeof value === 'string' && !value.includes('{{')) {
      if (!def.options.some((o) => String(o.value) === value)) problems.push(`${where}: "${id}" = "${value}" is not an option (${def.options.map((o) => o.value).join(', ')})`);
    }
    if (def.type === 'range' && typeof value === 'number' && (value < def.min || value > def.max)) {
      problems.push(`${where}: "${id}" = ${value} is outside ${def.min}..${def.max}`);
    }
  }
};

const walkBlocks = (where, blocks = {}, order = [], local = []) => {
  for (const id of order) if (!blocks[id]) problems.push(`${where}: block_order names "${id}", which is not defined`);
  for (const [id, block] of Object.entries(blocks)) {
    if (block.type.startsWith('shopify://')) continue;
    // A section may define its own blocks in its schema instead of theme blocks.
    const schema = local.find((b) => b.type === block.type && b.settings) || schemaOf('blocks', block.type);
    const here = `${where} > ${id} (${block.type})`;
    if (!schema) {
      problems.push(`${here}: no such block`);
      continue;
    }
    if (!block.static && !order.includes(id)) problems.push(`${here}: not static and missing from block_order`);
    checkSettings(here, schema, block.settings);
    walkBlocks(here, block.blocks, block.block_order || []);
  }
};

const checkFile = (file) => {
  const data = JSON.parse(stripComment(readFileSync(file, 'utf8')));
  if (file.endsWith('settings_data.json')) {
    const schema = JSON.parse(readFileSync(join(HORIZON, 'config/settings_schema.json'), 'utf8'));
    checkSettings(file, { settings: schema.flatMap((group) => group.settings || []) }, Object.fromEntries(
      Object.entries(data.current).filter(([k]) => !['color_schemes', 'content_for_index', 'blocks', 'sections'].includes(k)),
    ));
    return;
  }
  for (const id of data.order || []) if (!data.sections[id]) problems.push(`${file}: order names "${id}", which is not defined`);
  for (const [id, section] of Object.entries(data.sections || {})) {
    const schema = schemaOf('sections', section.type);
    const here = `${file} > ${id} (${section.type})`;
    if (!schema) {
      problems.push(`${here}: no such section`);
      continue;
    }
    checkSettings(here, schema, section.settings);
    walkBlocks(here, section.blocks, section.block_order || [], schema.blocks || []);
  }
};

const files = [];
for (const dir of ['templates', 'sections', 'config']) {
  const path = join(WHISPER, dir);
  if (!existsSync(path)) continue;
  for (const name of readdirSync(path)) if (name.endsWith('.json') && name !== 'settings_schema.json') files.push(join(path, name));
}
for (const file of files) {
  try {
    checkFile(file);
  } catch (error) {
    problems.push(`${file}: ${error.message}`);
  }
}
console.log(`${files.length} files checked`);
for (const p of problems) console.log(`FAIL  ${p.replace(WHISPER + '/', '')}`);
process.exit(problems.length ? 1 : 0);
