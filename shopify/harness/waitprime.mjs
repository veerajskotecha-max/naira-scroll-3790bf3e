const THEME='151142826146', SHOP='https://nc5eti-gp.myshopify.com';
for (let i=1;i<=10;i++){
  try{
    const r=await fetch(`${SHOP}/?preview_theme_id=${THEME}`,{headers:{'user-agent':'Mozilla/5.0'}});
    const t=await r.text();
    const id=(t.match(/Shopify\.theme\s*=\s*\{[^}]*"id":(\d+)/)||[,null])[1];
    console.log(`attempt ${i}: HTTP ${r.status}, theme ${id||'none'}`);
    if (id===THEME){ console.log('PREVIEW OK'); process.exit(0); }
  }catch(e){ console.log(`attempt ${i}: ${e.message.slice(0,60)}`); }
  await new Promise(r=>setTimeout(r,25000));
}
console.log('STILL BLOCKED'); process.exit(1);
