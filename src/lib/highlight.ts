import { codeToHtml } from "shiki";

export async function highlightCode(code: string): Promise<string> {
  return codeToHtml(code, {
    lang: "typescript",
    theme: "catppuccin-mocha",
  });
}
