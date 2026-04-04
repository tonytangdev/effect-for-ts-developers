import { highlightCode } from "@/lib/highlight";

interface CodeBlockProps {
  code: string;
}

export async function CodeBlock({ code }: CodeBlockProps) {
  const html = await highlightCode(code);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
