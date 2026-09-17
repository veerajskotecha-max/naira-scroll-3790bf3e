// Push local files to Shopify staged-upload targets, then print the
// themeFilesUpsert variables to paste back into the Admin API call.
//
// usage:  node stage-push.mjs targets.json  path/local=theme/path [...]
// where targets.json is the raw `stagedUploadsCreate` response body, and each
// pair maps a local file to the theme filename it should land at. Targets are
// matched to pairs by ORDER, which is the order stagedUploadsCreate returns.
//
// Why this exists: `body: {type: URL}` upserts return an EMPTY array whether
// or not they worked, so the only proof is a checksum read-back. But they cost
// nothing to send, where BASE64 bodies have to travel through the model's
// context. For anything bigger than a snippet, stage it.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const raw = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const targets = (raw.data?.stagedUploadsCreate ?? raw.stagedUploadsCreate ?? raw).stagedTargets;
const pairs = process.argv.slice(3).map(a => { const i = a.indexOf('='); return [a.slice(0, i), a.slice(i + 1)]; });
if (targets.length !== pairs.length) throw new Error(`${targets.length} targets vs ${pairs.length} pairs`);

const files = [];
targets.forEach((t, i) => {
  const [local, themePath] = pairs[i];
  const args = ['-sS', '-o', '/dev/null', '-w', '%{http_code}', '-X', 'POST', t.url];
  for (const { name, value } of t.parameters) args.push('-F', `${name}=${value}`);
  args.push('-F', `file=@${local}`);
  const code = execFileSync('curl', args, { encoding: 'utf8' }).trim();
  const md5 = createHash('md5').update(readFileSync(local)).digest('hex');
  console.error(`${code === '201' ? 'ok ' : 'FAIL'} ${local} -> ${themePath}  md5=${md5}`);
  if (code !== '201') throw new Error(`upload failed for ${local}: HTTP ${code}`);
  files.push({ filename: themePath, body: { type: 'URL', value: t.resourceUrl } });
});
console.log(JSON.stringify({ themeId: 'gid://shopify/OnlineStoreTheme/151142826146', files }, null, 1));
