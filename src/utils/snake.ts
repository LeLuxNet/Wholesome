export function camel2Snake(s: string): string {
  return s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

export function camelObject2Snake<T>(o: Record<string, T>): Record<string, T> {
  const res: Record<string, T> = {};
  for (const [key, val] of Object.entries(o)) {
    res[camel2Snake(key)] = val;
  }
  return res;
}
