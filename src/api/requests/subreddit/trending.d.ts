/// <reference path="../../index.d.ts" />
declare namespace Api {
  export interface TrendingSubreddits {
    subreddit_names: string[];
    comment_count: number;
    comment_url: string;
  }
}
