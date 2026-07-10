import { readFile } from "node:fs/promises";
import path from "node:path";

/** Served as /docs/agent-api.md via rewrite in next.config.ts */
export async function GET() {
  const filePath = path.join(process.cwd(), "docs", "AGENT_API.md");
  const body = await readFile(filePath, "utf8");

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=300",
    },
  });
}
