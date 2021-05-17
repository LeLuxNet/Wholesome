/// <reference path="../../index.d.ts" />
declare namespace Api {
  export type CommentMoreWrap = CommentWrap | MoreWrap;

  export interface CommentWrap {
    kind: "t1";
    data: Comment;
  }

  export interface Comment extends Thing, Votable, Authored, Created {
    total_awards_received: number;
    approved_at_utc: number | null;
    comment_type: null;
    awarders: [];
    mod_reason_by: null;
    banned_by: string | null;
    removal_reason: null;
    link_id: string;
    replies: "" | Listing<CommentMoreWrap>;
    user_reports: unknown[];
    saved: boolean;
    banned_at_utc: number | null;
    mod_reason_title: string;
    gilded: number;
    archived: boolean;
    no_follow: boolean;
    can_mod_post: boolean;
    send_replies: boolean;
    parent_id: string;
    approved_by: string | null;
    report_reasons: null;
    all_awardings: Award[];
    subreddit_id: string;
    body: string;
    edited: number | false;
    collapsed: boolean;
    is_submitter: boolean;
    body_html: string;
    gildings: Gildings;
    collapsed_reason: null;
    associated_award: null;
    stickied: boolean;
    subreddit_type: SubredditType | "user";
    can_gild: boolean;
    top_awarded_type: null;
    score_hidden: boolean;
    permalink: string;
    num_reports: null;
    locked: boolean;
    subreddit: string;
    treatment_tags: [];
    subreddit_name_prefixed: string;
    controversiality: number;
    depth: number;
    collapsed_because_crowd_control: null;
    mod_reports: [];
    mod_note: null;
    distinguished: Distinguish;
  }
}
