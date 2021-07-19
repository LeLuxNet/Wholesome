/// <reference path="../../index.d.ts" />
declare namespace Api {
  export interface TrendingSubreddits {
    subreddit_names: string[];
    comment_count: number;
    comment_url: string;
  }

  export interface TrendingSearches {
    trending_searches: {
      group: [];
      subreddit_occurences: number;
      brand_safe: boolean;
      results: Listing<SubmissionWrap>;
      query_string: string;
      display_string: string;
      is_subreddit_whitelisted: boolean;
    }[];
  }
}
