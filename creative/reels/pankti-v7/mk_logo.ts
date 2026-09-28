import { writeFileSync } from "fs";
import { FLOWER_ASPECT, flowerPath } from "../../../src/lib/nairaFlower/outline";
import { WORDMARK, WORDMARK_FLOWER as F } from "../../../src/lib/nairaFlower/wordmark";
const fl = F.cx - (FLOWER_ASPECT / 2) * F.height, ft = F.cy - F.height / 2;
const svg = (word: string, flower: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WORDMARK.width} ${WORDMARK.height}" overflow="visible"><path d="${WORDMARK.d}" fill="${word}"/><path d="${flowerPath()}" transform="translate(${fl} ${ft}) scale(${F.height})" fill="${flower}"/></svg>`;
writeFileSync(process.argv[2] + "/logo_ink.svg", svg("#1A1614", "#C99A4C"));
writeFileSync(process.argv[2] + "/logo_ivory.svg", svg("#FBF3EC", "#FFBDA8"));
console.log("ok", WORDMARK.width, WORDMARK.height);
