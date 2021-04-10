import EventEmitter from "node:events";
import Identified from "../interfaces/identified";
import Reddit from "../reddit";
import { get, GetOptions } from "./get";
import { stream, StreamCallback, StreamOptions } from "./stream";

export default class List<I extends Identified, T> extends EventEmitter {
  get: (options?: GetOptions) => Promise<I[]>;
  listen: (fn: StreamCallback<I>, options?: StreamOptions) => void;

  constructor(r: Reddit, url: string, map: (d: T) => I) {
    super();
    this.get = (options?: GetOptions) => get(r, url, map, options);
    this.listen = (fn, options?) => stream(r, url, map, fn, options);
  }
}
