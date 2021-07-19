export const pageLimit = 25;

export interface PageOptions {
  limit?: number;
}

export interface Page<T> {
  items: T[];

  options: PageOptions;

  next: (limit?: number) => Promise<Page<T>>;
  prev: (limit?: number) => Promise<Page<T>>;
}
