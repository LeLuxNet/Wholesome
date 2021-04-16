/// <reference path="../../index.d.ts" />
declare namespace Api {
  export type FlairType = "richtext" | "text";

  export type UserFlair = TextFlair | EmojiFlair;

  interface TextFlair {
    e: "text";
    t: string;
  }

  interface EmojiFlair {
    a: string;
    u: string;
    e: "emoji";
  }
}
