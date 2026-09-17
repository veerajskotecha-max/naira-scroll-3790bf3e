import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
const [src,out,X,Y,W,H,SC='1'] = process.argv.slice(2);
const data='data:image/png;base64,'+readFileSync(src).toString('base64');
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:Math.round(+W*+SC),height:Math.round(+H*+SC)}});
await p.setContent(`<style>html,body{margin:0;overflow:hidden;background:#222}
 img{position:absolute;left:${-X*+SC}px;top:${-Y*+SC}px;transform-origin:0 0;transform:scale(${SC})}</style><img src="${data}">`);
await p.waitForTimeout(400);
writeFileSync(out, await p.screenshot());
console.log('cropped', out);
await b.close();
