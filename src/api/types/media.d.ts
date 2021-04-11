/// <reference path="../index.d.ts" />
declare namespace Api {
  export interface Media {
    args: {
      action: string;
      fields: { name: string; value: string }[];
    };
    asset: {
      asset_id: string;
      processing_state: "incomplete";
      payload: {
        filepath: string;
      };
      websocket_url: string;
    };
  }
}
