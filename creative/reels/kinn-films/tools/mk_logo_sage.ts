// The site header's wordmark, as one SVG: NAIRA in brand sage with the blush flower standing as its I (src/lib/nairaFlower).
import { writeFileSync } from "fs";
import { FLOWER_ASPECT, flowerPath } from "../../../../src/lib/nairaFlower/outline";
import { WORDMARK, WORDMARK_FLOWER as F } from "../../../../src/lib/nairaFlower/wordmark";
const fl = F.cx - (FLOWER_ASPECT / 2) * F.height, ft = F.cy - F.height / 2;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WORDMARK.width} ${WORDMARK.height}" width="${WORDMARK.width}" height="${WORDMARK.height}" overflow="visible"><path d="${WORDMARK.d}" fill="#99B4AF"/><path d="${flowerPath()}" transform="translate(${fl} ${ft}) scale(${F.height})" fill="#FFBDA8"/></svg>`;
writeFileSync(process.argv[2], svg);
console.log("ok", WORDMARK.width, WORDMARK.height, svg.length);
