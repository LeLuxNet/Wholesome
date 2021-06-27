/// <reference path="../../index.d.ts" />
declare namespace Api {
  export interface BaseAward {
    giver_coin_reward: null;
    subreddit_id: null;
    is_new: boolean;
    days_of_drip_extension: number;
    coin_price: number;
    id: string;
    penny_donate: null;
    coin_reward: number;
    days_of_premium: number;
    start_date: number | null;
    is_enabled: boolean;
    description: string;
    end_date: number | null;
    subreddit_coin_reward: number;
    name: string;
    icon_format: null;
    award_sub_type: AwardSubType;
    penny_price: null;
    award_type: "global";
  }

  export interface Award extends BaseAward {
    icon_url: string;
    icon_height: number;
    icon_width: number;
    resized_icons: Image[];

    static_icon_url: string;
    static_icon_height: number;
    static_icon_width: number;
    resized_static_icons: Image[];

    tiers_by_required_awardings: AwardTiers | null;
    awardings_required_to_grant_benefits: number | null;

    count: number;
  }

  export interface GAward extends BaseAward {
    icon: BaseImage;
    icon32: BaseImage;
    icon64: BaseImage;
    icon128: BaseImage;

    static_icon: BaseImage;
    static_icon32: BaseImage;
    static_icon64: BaseImage;
    static_icon128: BaseImage;

    tags: string[];
    tiers: unknown | null;
    is_optional: false;
  }

  type AwardSubType = "GLOBAL" | "GROUP" | "PREMIUM" | "APPRECIATION";

  interface AwardTiers {
    [index: string]: {
      resized_static_icons: Image[];
      resized_icons: Image[];
      static_icon: Image;
      awardings_required: number;
      icon: Image;
    };
  }
}
