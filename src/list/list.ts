import { EventEmitter } from "events";
import Identified from "../interfaces/identified";
import Reddit from "../reddit";
import { get, GetOptions } from "./get";
import Page from "./page";
import { stream, StreamOptions } from "./stream";

export declare interface List<I extends Identified, T> {
  on(event: "item", listener: (val: I) => void): this;
  once(event: "item", listener: (val: I) => void): this;
  emit(event: "item", val: I): boolean;
}

export class List<I extends Identified, T> extends EventEmitter {
  get: (options?: GetOptions) => Promise<Page<I, T>>;
  listen: (options?: StreamOptions) => void;

  constructor(r: Reddit, url: string, map: (d: T) => I) {
    super();
    this.get = (options?: GetOptions) => get(r, url, map, options);
    this.listen = (options?) =>
      stream(r, url, map, (d) => this.emit("item", d), options);
  }
}
