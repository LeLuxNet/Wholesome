/// <reference path="../../index.d.ts" />
declare namespace Api {
  export interface Relation {
    name: string;
    date: number;
    rel_id: string;
    id: string;
  }

  export interface RelationList<T = Relation> {
    kind: "UserList";
    data: {
      children: T[];
    };
  }
}
