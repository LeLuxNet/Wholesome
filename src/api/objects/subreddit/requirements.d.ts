/// <reference path="../../index.d.ts" />
declare namespace Api {
  export interface SubredditRequirements {
    title_regexes: string[];
    body_blacklisted_strings: string[];
    title_blacklisted_strings: string[];
    body_text_max_length: number | null;
    title_required_strings: string[];
    guidelines_text: string;
    gallery_min_items: number | null;
    domain_blacklist: string[];
    domain_whitelist: string[];
    title_text_max_length: number | null;
    body_restriction_policy: "required";
    link_restriction_policy: "blacklist" | "whitelist";
    guidelines_display_policy: null;
    body_required_strings: string[];
    title_text_min_length: number | null;
    gallery_captions_requirement: "none";
    is_flair_required: boolean;
    gallery_max_items: number | null;
    gallery_urls_requirement: "none";
    body_regexes: string[];
    link_repost_age: number | null;
    body_text_min_length: number | null;
  }
}
