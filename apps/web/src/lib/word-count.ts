export function countWords(value: string): number {
  return value.replace(/\s+/g, "").length;
}

export function textToHtml(value: string): string {
  return value
    .split(/\n+/)
    .filter(Boolean)
    .map((line) => `<p>${line.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`)
    .join("");
}
