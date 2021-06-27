/// <reference path="../../index.d.ts" />
declare namespace Api {
  export interface FreeAwardCheck {
    econSpecialEvents: {
      coinSale: null;
      freeAwardEvent: {
        isEnabled: true;
        freeAwards: {
          awards: [];
        };
        startsAt: null;
      };
      avatarMarketingEvent: unknown;
    };
  }

  export interface FreeAwardClaim {
    claimAwardOffer: {
      ok: boolean;
      errors: null;

      // Camel case version of GAward
      awards: any[];
    };
  }
}
