/// <reference path="../../index.d.ts" />
declare namespace Api {
  export interface Snoo {
    snoo_color: string;
    public: boolean;
    components: {
      "snoo-body": SnooComponent;
      grippables: SnooComponent;
      hats: SnooComponent;
      tops: SnooComponent;
      flipped_grippables: SnooComponent;
      bottoms: SnooComponent;
      glasses: SnooComponent;
      "snoo-head": SnooComponent;
    };
  }

  export interface SnooComponent {
    color?: string;
    dressingName?: string;
    altColor?: string;
  }
}
