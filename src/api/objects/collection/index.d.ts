/// <reference path="../../index.d.ts" />
declare namespace Api {
  export interface Collection extends SubmissionCollection {
    // sorted_links: Listing<SubmissionWrap>;
    primary_link_id: string;
  }

  export interface SubmissionCollection {
    permalink: string;
    link_ids: string[];
    description: string;
    title: string;
    created_at_utc: number;
    subreddit_id: string;
    author_name: string;
    collection_id: string;
    author_id: string;
    last_update_utc: number;
    display_layout: null;
  }
}
