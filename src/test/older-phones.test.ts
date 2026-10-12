import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";

/* The build targets Vite's default browsers (Safari 14, Chrome 87): it rewrites
   newer syntax for them but not newer built-in methods. Array and string .at()
   only arrived in Safari 15.4 and Chrome 92, so on an older iPhone, or in the
   in-app browser of an older Android where ad taps open, it throws and takes
   the component down with it (the bag, the first time). Keep it out. */
const src = resolve(__dirname, "..");
const files = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? files(join(dir, e.name))
      : /\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)
        ? [join(dir, e.name)]
        : [],
  );

describe("code that runs on older phones", () => {
  it("never calls .at(), which Safari before 15.4 does not have", () => {
    const offenders = files(src).flatMap((file) =>
      readFileSync(file, "utf8")
        .split("\n")
        .flatMap((line, i) => (/\.at\(/.test(line) ? [`${relative(src, file)}:${i + 1}`] : [])),
    );
    expect(offenders).toEqual([]);
  });
});
