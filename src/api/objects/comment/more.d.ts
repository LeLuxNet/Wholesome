/// <reference path="../../index.d.ts" />
declare namespace Api {
  export interface MoreWrap {
    kind: "more";
    data: More;
  }

  export interface More {
    count: number;
    name: string;
    id: string;
    parent_id: string;
    depth: number;
    children: string[];
  }
}
