const THEME='151142826146', SHOP='https://nc5eti-gp.myshopify.com';
const jar=new Map(); const ch=()=>[...jar].map(([k,v])=>`${k}=${v}`).join('; ');
const eat=r=>{for(const[k,v]of r.headers)if(k.toLowerCase()==='set-cookie')v.split(/,(?=[^;]+=)/).forEach(c=>{const[a,b]=c.split(';')[0].split('=');if(a&&b)jar.set(a.trim(),b.trim());});};
// Go straight at the sharing-token endpoint ON THE MYSHOPIFY HOST. The default
// chain bounces it to the primary domain, which is the React app, so the token
// is never issued and the preview silently serves the live site instead.
let url=`${SHOP}/services/access_tokens/create_sharing/${THEME}?return_to=%2F%3F_ab%3D0%26_fd%3D0%26_sc%3D1`;
for (let i=0;i<8;i++){
  const r=await fetch(url,{redirect:'manual',headers:{cookie:ch(),'user-agent':'Mozilla/5.0'}});
  eat(r);
  const loc=r.headers.get('location');
  console.log(i, r.status, String(loc||'(end)').slice(0,110), '|', [...jar.keys()].join(','));
  if (!loc) break;
  let next = loc.startsWith('http') ? loc : SHOP+loc;
  next = next.replace(/https:\/\/(www\.)?nairaflore\.com/, SHOP);   // keep it on myshopify
  url = next;
}
for (const p of ['/collections','/','/pages/does-not-exist-xyz']) {
  const r=await fetch(`${SHOP}${p}${p.includes('?')?'&':'?'}_ab=0&_fd=0&_sc=1`,{headers:{cookie:ch(),'user-agent':'Mozilla/5.0'},redirect:'follow'});
  const t=await r.text();
  console.log(p, r.status, 'len', t.length, '| theme:', (t.match(/Shopify\.theme\s*=\s*\{[^}]*"id":(\d+)/)||[,'ABSENT'])[1], '| nf-brand:', /nf-brand\.css/.test(t));
}
