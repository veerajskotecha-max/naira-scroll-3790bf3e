import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/*
  A member who accepts ad matching has their email AND their phone number
  hashed and sent to Meta (src/lib/pixel.ts setAdMatchIdentity, fed the
  profile phone by PixelEvents; CLAUDE.md records both as intended). The
  privacy policy and both consent checkboxes named the email only.
*/
const read = (file: string) => readFileSync(resolve(__dirname, "..", file), "utf8").replace(/\s+/g, " ");
const privacy = read("pages/PrivacyPolicy.tsx");
const pixel = read("lib/pixel.ts");

describe("what members are told is shared with Meta matches what is sent", () => {
  it("still sends the hashed phone with the hashed email (the behaviour being disclosed)", () => {
    expect(pixel).toMatch(/if \(phone\) next\.ph = await sha256Hex\(phone\);/);
    expect(pixel).toMatch(/matchKeys\.ph \? \{ ph: matchKeys\.ph \}/);
  });

  it("names the phone number in the privacy policy", () => {
    const paragraph = privacy.match(/If you hold a Naira Flore member account[^<]*/)![0];
    expect(paragraph).toMatch(/hashed\) version of your email address and, if you have added one to your account, your phone number with Meta/);
    expect(paragraph).toMatch(/Your email address and phone number themselves are never shared/);
    expect(paragraph).not.toMatch(/Your email address itself is never shared/);
  });

  it.each(["pages/Auth.tsx", "pages/Account.tsx"])("names the phone number at the consent box (%s)", (file) => {
    const box = read(file).match(/Show me Naira Flore pieces on social media\.[^<]*/)![0];
    expect(box).toMatch(/Your email, and your phone number if you add one, are scrambled before they leave this site and shared with Meta only to match you\./);
  });
});
