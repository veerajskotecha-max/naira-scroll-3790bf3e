const THEME='151142826146', SHOP='https://nc5eti-gp.myshopify.com';
const jar=new Map(); const ch=()=>[...jar].map(([k,v])=>`${k}=${v}`).join('; ');
const eat=r=>{for(const[k,v]of r.headers)if(k.toLowerCase()==='set-cookie')v.split(/,(?=[^;]+=)/).forEach(c=>{const[a,b]=c.split(';')[0].split('=');if(a&&b)jar.set(a.trim(),b.trim());});};
let url=`${SHOP}/?_ab=0&_fd=0&_sc=1&preview_theme_id=${THEME}`;
for (let i=0;i<6;i++){
  const r=await fetch(url,{redirect:'manual',headers:{cookie:ch(),'user-agent':'Mozilla/5.0'}});
  eat(r);
  const loc=r.headers.get('location');
  console.log(i, r.status, '->', loc||'(no redirect)', '| cookies:', [...jar.keys()].join(','));
  if (!loc) break;
  url = loc.startsWith('http') ? loc : SHOP+loc;
}
const r=await fetch(`${SHOP}/collections?_ab=0&_fd=0&_sc=1&preview_theme_id=${THEME}`,{headers:{cookie:ch(),'user-agent':'Mozilla/5.0'},redirect:'follow'});
const t=await r.text();
console.log('final /collections', r.status, 'len', t.length, '| Shopify.theme:', /Shopify\.theme/.test(t)?'present':'ABSENT', '| savor marker:', /nf-brand\.css/.test(t)?'yes':'no');
