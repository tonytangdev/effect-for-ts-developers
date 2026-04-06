import { codeToHtml } from "shiki";

export async function highlightCode(code: string): Promise<string> {
  return codeToHtml(code, {
    lang: "typescript",
    themes: {
      dark: "catppuccin-mocha",
      light: "catppuccin-latte",
    },
    defaultColor: false,
  });
}
