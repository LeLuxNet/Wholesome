/// <reference path="./index.d.ts" />
declare namespace Api {
  export type ListingRes<T> = Listing<T> | [unknown, Listing<T>];

  export interface Listing<T> {
    kind: "Listing";
    data: {
      modhash: string;
      dist: number | null;
      children: T[];
      after: string | null;
      before: string | null;
    };
  }

  export interface GListing<T> {
    edges: {
      node: T;
    }[];

    pageInfo: {
      endCursor: string;
    };
  }
}
