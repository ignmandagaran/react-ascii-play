import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// The module .d.ts files are written by hand next to the .js they describe.
// This catches the two drifting apart: an export with no declaration, or a
// declaration (or a missing `export`) with no matching export.

const modulesDir = join(import.meta.dir, "../src/modules");
const modules = readdirSync(modulesDir)
  .filter((f) => f.endsWith(".js"))
  .map((f) => f.slice(0, -3));

function declaredValueExports(source: string) {
  const names = new Set<string>();
  for (const m of source.matchAll(/^export\s+(?:declare\s+)?(?:async\s+)?(?:function|const|let|var|class)\s+(\w+)/gm)) {
    names.add(m[1]);
  }
  if (/^export\s+default\b/m.test(source)) names.add("default");
  return [...names].sort();
}

describe("module declarations match their exports", () => {
  for (const name of modules) {
    test(name, async () => {
      const runtime = Object.keys(await import(join(modulesDir, `${name}.js`))).sort();
      const declared = declaredValueExports(readFileSync(join(modulesDir, `${name}.d.ts`), "utf8"));
      expect(declared).toEqual(runtime);
    });
  }
});
