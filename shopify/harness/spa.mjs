import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const ROOT='/home/user/naira-scroll-3790bf3e/dist';
const T={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript','.mjs':'application/javascript',
 '.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon',
 '.woff2':'font/woff2','.ttf':'font/ttf','.json':'application/json','.txt':'text/plain','.gif':'image/gif'};
http.createServer((req,res)=>{
  const u=decodeURIComponent((req.url||'/').split('?')[0]);
  let f=path.join(ROOT,u);
  if(!fs.existsSync(f)||fs.statSync(f).isDirectory()) f=path.join(ROOT,'index.html'); // SPA fallback
  res.writeHead(200,{'Content-Type':T[path.extname(f)]||'application/octet-stream'});
  fs.createReadStream(f).pipe(res);
}).listen(4325,'127.0.0.1',()=>console.log('spa 4325'));
