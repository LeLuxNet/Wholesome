export function unrefTimeout(callback: Function, ms: number): void {
  const t: NodeJS.Timeout | number = setTimeout(callback, ms) as any;

  if (typeof t === "object") t.unref();
}
