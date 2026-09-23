const THEME='151142826146', SHOP='https://nc5eti-gp.myshopify.com';
const PREVIEW=`_ab=0&_fd=0&_sc=1&preview_theme_id=${THEME}`;
const jar=new Map(); const ch=()=>[...jar].map(([k,v])=>`${k}=${v}`).join('; ');
const eat=r=>{for(const[k,v]of r.headers)if(k.toLowerCase()==='set-cookie')v.split(/,(?=[^;]+=)/).forEach(c=>{const[a,b]=c.split(';')[0].split('=');if(a&&b)jar.set(a.trim(),b.trim());});};
eat(await fetch(`${SHOP}/?${PREVIEW}`,{redirect:'manual'}));
for (const path of process.argv.slice(2)) {
  const r = await fetch(`${SHOP}${path}${path.includes('?')?'&':'?'}${PREVIEW}`, {headers:{cookie:ch()}, redirect:'follow'});
  const t = await r.text();
  const theme = (t.match(/Shopify\.theme\s*=\s*(\{[^}]*\})/)||[])[1];
  console.log(path, '->', r.status, r.headers.get('content-type'), 'len', t.length);
  console.log('   Shopify.theme:', theme ? theme.slice(0,90) : 'ABSENT');
  const err = t.match(/(Liquid error[^<]{0,200}|Invalid[^<]{0,160}|error[^<]{0,120})/i);
  if (!theme) console.log('   first 300:', t.replace(/\s+/g,' ').slice(0,300));
}
