/// <reference path="../index.d.ts" />
declare namespace Api {
  export interface Award {
    giver_coin_reward: null;
    subreddit_id: null;
    is_new: boolean;
    days_of_drip_extension: number;
    coin_price: number;
    id: string;
    penny_donate: null;
    coin_reward: number;
    icon_url: string;
    days_of_premium: number;
    icon_height: number;
    tiers_by_required_awardings: AwardTiers | null;
    resized_icons: Image[];
    icon_width: number;
    static_icon_width: number;
    start_date: number | null;
    is_enabled: boolean;
    awardings_required_to_grant_benefits: number | null;
    description: string;
    end_date: number | null;
    subreddit_coin_reward: number;
    count: number;
    static_icon_height: number;
    name: string;
    resized_static_icons: Image[];
    icon_format: null;
    award_sub_type: "GLOBAL" | "GROUP" | "PREMIUM" | "APPRECIATION";
    penny_price: null;
    award_type: "global";
    static_icon_url: string;
  }

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
