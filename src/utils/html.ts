export function jsonFunction(name: string, html: string): any {
  const prefix = name + "(";

  const from = html.indexOf(prefix) + prefix.length;
  const to = html.indexOf(")", from);

  return JSON.parse(html.slice(from, to));
}

export function jsonVariable(name: string, html: string): any {
  const prefix = html.match(new RegExp(`${name}\\s*=`))!;

  const from = html.slice(prefix.index! + prefix[0].length);
  const to = from.match(/;|</)!.index!;

  return JSON.parse(from.slice(0, to));
}
