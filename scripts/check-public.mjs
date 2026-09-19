import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = process.cwd();
const forbidden = [
  /chatgpt/i,
  /claude/i,
  /codex/i,
  /internal note/i,
  /recruiter advice/i,
  /portfolio advice/i,
  /\b(?:TODO FOR EMILIANO|PROMPT:)\b/i
];
const excluded = new Set(["node_modules", ".next", ".git", "playwright-report", "test-results", "generated"]);
const textExtensions = new Set([".ts", ".tsx", ".js", ".mjs", ".json", ".md", ".css", ".yml", ".yaml", ".prisma"]);

function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (excluded.has(name)) continue;
    const path = join(dir, name);
    if (resolve(path) === resolve(root, "scripts", "check-public.mjs")) continue;
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path);
    else {
      const dot = name.lastIndexOf(".");
      const ext = dot >= 0 ? name.slice(dot) : "";
      if (!textExtensions.has(ext) && name !== "Dockerfile") continue;
      const text = readFileSync(path, "utf8");
      for (const pattern of forbidden) {
        if (pattern.test(text)) throw new Error(`Forbidden public meta-content in ${relative(root, path)}: ${pattern}`);
      }
    }
  }
}

walk(root);
console.log("Public repository content check passed.");
