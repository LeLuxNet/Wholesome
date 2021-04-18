import Fetchable from "../interfaces/fetchable";

export default class Cache<T> {
  duration: number;

  data: Map<string, [val: T, until: number]> = new Map();

  constructor(seconds: number) {
    this.duration = seconds * 1000;
  }

  async get(val: Fetchable<T>): Promise<T> {
    const now = Date.now();

    const cached = this.data.get(val.key);
    if (cached && cached[1] >= now) return cached[0];

    const fetched = await val.fetch();
    this.data.set(val.key, [fetched, now + this.duration]);
    return fetched;
  }
}
