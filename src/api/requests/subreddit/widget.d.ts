/// <reference path="../../index.d.ts" />
declare namespace Api {
  export interface SubredditWidgets {
    items: {
      [id: string]: Widget;
    };
    layout: {
      idCardWidget: string; // IdCardWidget
      topbar: Order; // MenuWidget
      sidebar: Order;
      moderatorWidget: string; // ModWidget
    };
  }

  interface Order {
    order: string[];
  }
}
