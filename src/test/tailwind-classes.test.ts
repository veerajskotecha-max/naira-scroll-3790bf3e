import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";

/* tailwindcss-animate defines its own duration-*, delay-* and ease-* for
   animations, so an arbitrary duration (the card had duration-[ 600ms ]
   without the spaces) matches two utilities. Tailwind calls it ambiguous and
   generates NOTHING for it: the product card's hover zoom ran at the default
   150 ms instead of 600 ms. Use a configured step (duration-600) or the
   property form ([transition-duration:600ms]) instead. Spelt with spaces
   here because Tailwind scans this file too, and warns on the bare class. */
const src = resolve(__dirname, "..");
const files = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? files(join(dir, e.name))
      : /\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)
        ? [join(dir, e.name)]
        : [],
  );

describe("Tailwind classes that generate CSS", () => {
  it("never uses an arbitrary duration, delay or ease value, which Tailwind drops as ambiguous", () => {
    const offenders = files(src).flatMap((file) =>
      readFileSync(file, "utf8")
        .split("\n")
        .flatMap((line, i) =>
          /(^|[\s"'`:])(duration|delay|ease)-\[/.test(line) ? [`${relative(src, file)}:${i + 1}`] : [],
        ),
    );
    expect(offenders).toEqual([]);
  });
});
