/// <reference path="../../index.d.ts" />
declare namespace Api {
  export interface TrophyList {
    kind: "TrophyList";
    data: {
      trophies: TrophyWrap[];
    };
  }

  export interface TrophyWrap {
    kind: "t6";
    data: Trophy;
  }

  export interface Trophy {
    icon_70: string;
    granted_at: number | null;
    url: string | null;
    icon_40: string;
    name: string;
    award_id: string | null;
    id: string | null;
    description: string | null;
  }
}
