import { describe, expect, it } from "vitest";
import { textToDocumentJson } from "./content";

describe("textToDocumentJson", () => {
  it("converts each line into a paragraph", () => {
    const result = JSON.parse(textToDocumentJson("First line\nSecond line"));
    expect(result.type).toBe("doc");
    expect(result.content).toHaveLength(2);
    expect(result.content[0].content[0].text).toBe("First line");
    expect(result.content[1].content[0].text).toBe("Second line");
  });

  it("keeps empty lines as empty paragraphs", () => {
    const result = JSON.parse(textToDocumentJson("Hello\n\nWorld"));
    expect(result.content).toHaveLength(3);
    expect(result.content[1].content).toEqual([]);
  });

  it("falls back to a single empty paragraph for blank input", () => {
    const result = JSON.parse(textToDocumentJson(""));
    expect(result.type).toBe("doc");
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("paragraph");
  });
});
