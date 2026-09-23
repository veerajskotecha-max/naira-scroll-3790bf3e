const THEME='151142826146', SHOP='https://nc5eti-gp.myshopify.com';
const jar=new Map(); const ch=()=>[...jar].map(([k,v])=>`${k}=${v}`).join('; ');
const eat=r=>{for(const[k,v]of r.headers)if(k.toLowerCase()==='set-cookie')v.split(/,(?=[^;]+=)/).forEach(c=>{const[a,b]=c.split(';')[0].split('=');if(a&&b)jar.set(a.trim(),b.trim());});};
const tryChain = async (start, label) => {
  jar.clear();
  let url = start;
  for (let i=0;i<8;i++){
    const r=await fetch(url,{redirect:'manual',headers:{cookie:ch(),'user-agent':'Mozilla/5.0'}});
    eat(r); const loc=r.headers.get('location'); if(!loc) break;
    url = (loc.startsWith('http')?loc:SHOP+loc).replace(/https:\/\/(www\.)?nairaflore\.com/, SHOP);
  }
  const r=await fetch(`${SHOP}/?_ab=0&_fd=0&_sc=1&preview_theme_id=${THEME}`,{headers:{cookie:ch(),'user-agent':'Mozilla/5.0'},redirect:'follow'});
  const t=await r.text();
  const id=(t.match(/Shopify\.theme\s*=\s*\{[^}]*"id":(\d+)/)||[,'?'])[1];
  console.log(label, '->', r.status, 'theme', id, '| nf-brand:', /nf-brand\.css/.test(t), '| cookies:', [...jar.keys()].join(','));
  return id === THEME;
};
await tryChain(`${SHOP}/?preview_theme_id=${THEME}`, 'A plain preview param');
await tryChain(`${SHOP}/?_ab=0&_fd=0&_sc=1&preview_theme_id=${THEME}`, 'B with _ab flags');
await tryChain(`${SHOP}/admin/themes/${THEME}/preview`, 'C admin preview path');
