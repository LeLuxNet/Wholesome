/// <reference path="../../index.d.ts" />
declare namespace Api {
  export type MessageWrap =
    | { kind: "t1"; data: MessageComment }
    | { kind: "t4"; data: MessageMessage };

  export type Message = MessageComment | MessageMessage;

  export interface MessageComment extends BaseMessage {
    subreddit: string;
    num_comments: number;
    parent_id: string;
    type: "post_reply" | "comment_reply";
    link_title: string;
    was_comment: true;
    context: string;
  }

  export interface MessageMessage extends BaseMessage {
    subreddit: null;
    num_comments: null;
    parent_id: null;
    type: "unknown";
    was_comment: false;
    context: "";
  }

  interface BaseMessage extends Created {
    first_message: null;
    first_message_name: null;
    likes: null;
    replies: "";
    author_fullname: string | null;
    id: string;
    subject: string;
    associated_awarding_id: string | null;
    score: number;
    author: string;
    subreddit_name_prefixed: string;
    new: boolean;
    body: string;
    link_title: string;
    dest: string;
    body_html: string;
    name: string;
    distinguished: Distinguish | "gold-auto";
  }
}
