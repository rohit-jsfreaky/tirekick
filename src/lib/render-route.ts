// Renders the recall sheet, the seller email and the status card with the same Hyper Elements templates the CLI uses. It runs in the
// browser (src/lib/render-local.ts), so the site is static files on Cloudflare.
// POST { output: "sheet" | "ask" | "card", values } -> a PDF, { html, text } for the email, a PNG.
import { createElement } from "react";
import { ElementsError, render } from "@hyper-elements/react";
import { renderImage } from "@hyper-elements/react/image";
import { renderPdf } from "@hyper-elements/react/pdf";
import Sheet from "@templates/sheet";
import Ask from "@templates/ask";
import Card from "@templates/card";

type Diagnostic = { severity: string; code: string; message: string; path?: string };

const FONT_FILES: Array<[string, string, number]> = [
  ["Barlow", "Barlow-Regular.ttf", 400],
  ["Barlow", "Barlow-SemiBold.ttf", 600],
  ["Barlow", "Barlow-Bold.ttf", 700],
  ["Barlow Condensed", "BarlowCondensed-Bold.ttf", 700],
];

// In the browser: fonts and the resvg WebAssembly come from /public; Buffer (used for base64) from the buffer package.
let ready: Promise<void> | undefined;
async function fontFile(file: string) {
  ready ??= (async () => {
    const { Buffer } = await import("buffer");
    (globalThis as { Buffer?: unknown }).Buffer ??= Buffer;
    const { initWasm } = await import("@resvg/resvg-wasm");
    await initWasm(fetch("/resvg.wasm"));
  })();
  await ready;
  return new Uint8Array(await (await fetch(`/fonts/${file}`)).arrayBuffer());
}
let fonts: Promise<Array<{ family: string; src: Uint8Array; weight: number }>> | undefined;
const loadFonts = () => (fonts ??= Promise.all(FONT_FILES.map(async ([family, file, weight]) => ({ family, weight, src: await fontFile(file) }))));

const brief = (list: readonly unknown[] = []): Diagnostic[] =>
  (list as Diagnostic[]).filter((d) => d.severity === "error" || d.severity === "warning").map(({ severity, code, message, path }) => ({ severity, code, message, path }));

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { output?: string; values?: Record<string, unknown> } | null;
  if (!body?.values || !["sheet", "ask", "card"].includes(body.output ?? "")) return Response.json({ error: 'Send { output: "sheet" | "ask" | "card", values }' }, { status: 400 });
  const { output, values } = body;
  try {
    if (output === "sheet") {
      const { pdf } = await renderPdf(createElement(Sheet as never, { ...values, format: "letter" }), { fonts: await loadFonts() });
      return new Response(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf" } });
    }
    if (output === "card") {
      const { image } = await renderImage(createElement(Card as never, { ...values, format: "card" }), { fonts: await loadFonts() });
      return new Response(new Uint8Array(image), { headers: { "Content-Type": "image/png" } });
    }
    const { html, text, diagnostics } = await render(createElement(Ask as never, values));
    return Response.json({ html, text, diagnostics: brief(diagnostics) });
  } catch (e) {
    if (e instanceof ElementsError) return Response.json({ diagnostics: brief(e.diagnostics) }, { status: 422 });
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
