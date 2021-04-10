/// <reference path="./index.d.ts" />
declare namespace Api {
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
}
