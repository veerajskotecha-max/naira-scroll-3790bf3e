const THEME='151142826146', SHOP='https://nc5eti-gp.myshopify.com';
const PREVIEW=`_ab=0&_fd=0&_sc=1&preview_theme_id=${THEME}`;
const jar=new Map(); const ch=()=>[...jar].map(([k,v])=>`${k}=${v}`).join('; ');
const eat=r=>{for(const[k,v]of r.headers)if(k.toLowerCase()==='set-cookie')v.split(/,(?=[^;]+=)/).forEach(c=>{const[a,b]=c.split(';')[0].split('=');if(a&&b)jar.set(a.trim(),b.trim());});};
eat(await fetch(`${SHOP}/?${PREVIEW}`,{redirect:'manual'}));
const html = await (await fetch(`${SHOP}/?${PREVIEW}`, {headers:{cookie:ch()}})).text();
const hrefs = [...new Set([...html.matchAll(/<link[^>]+href="([^"]+\.css[^"]*)"/g)].map(m=>m[1].replace(/&amp;/g,'&')))];
const needle = process.argv[2];
console.log('stylesheets:', hrefs.length);
for (const h of hrefs) {
  const u = h.startsWith('http') ? h : SHOP + h;
  let t; try { t = await (await fetch(u, {headers:{cookie:ch()}})).text(); } catch { continue; }
  if (!t.includes(needle)) continue;
  console.log('\n### ' + u.split('/').pop().split('?')[0]);
  let from = 0, k = 0;
  while ((from = t.indexOf(needle, from)) !== -1 && k < 8) {
    console.log('  ...' + t.slice(Math.max(0, from-300), from+300).replace(/\s+/g,' '));
    from += needle.length; k++;
  }
}
// also inline <style>
const inline = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1]).join('\n');
if (inline.includes(needle)) {
  console.log('\n### INLINE <style>');
  let from=0,k=0;
  while ((from = inline.indexOf(needle, from)) !== -1 && k < 8) {
    console.log('  ...' + inline.slice(Math.max(0,from-300), from+300).replace(/\s+/g,' ')); from += needle.length; k++;
  }
}
