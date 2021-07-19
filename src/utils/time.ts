export function unrefTimeout(callback: Function, ms: number): number {
  const t: NodeJS.Timeout | number = setTimeout(callback, ms) as any;

  if (typeof t === "object") t.unref();

  return t as number;
}
