/// <reference path="../../index.d.ts" />
declare namespace Api {
  export type ModPermission =
    | "all"
    | "access"
    | "chat_config"
    | "chat_operator"
    | "config"
    | "flair"
    | "mail"
    | "posts"
    | "wiki";

  export interface Moderator extends Relation {
    author_flair_text: string | null;
    mod_permissions: ModPermission[];
    author_flair_css_class: string | null;
  }
}
