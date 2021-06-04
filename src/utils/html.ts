export function jsonFunction(name: string, html: string): any {
  const prefix = name + "(";

  const from = html.indexOf(prefix) + prefix.length;
  const to = html.indexOf(")", from);

  return JSON.parse(html.slice(from, to));
}
