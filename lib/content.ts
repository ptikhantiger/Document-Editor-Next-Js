export const EMPTY_DOCUMENT_JSON = JSON.stringify({
  type: "doc",
  content: [{ type: "paragraph" }],
});

// Converts plain text (e.g. from an imported .txt/.md file) into a minimal
// Tiptap-compatible document, one paragraph per non-empty line.
export function textToDocumentJson(text: string): string {
  const lines = text.split(/\r?\n/);
  const content = lines.map((line) => ({
    type: "paragraph",
    content: line.trim() ? [{ type: "text", text: line }] : [],
  }));

  return JSON.stringify({
    type: "doc",
    content: content.length ? content : [{ type: "paragraph" }],
  });
}
