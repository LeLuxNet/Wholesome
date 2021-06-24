export interface Fetchable<T> {
  readonly key: string;

  fetch(): Promise<T>;
}
