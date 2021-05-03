/// <reference path="../../index.d.ts" />
declare namespace Api {
  export type ModPermission =
    | "all"
    | "wiki"
    | "chat_operator"
    | "chat_config"
    | "posts"
    | "access"
    | "mail"
    | "flair";

  export interface Moderator extends Relation {
    author_flair_text: string | null;
    mod_permissions: ModPermission[];
    author_flair_css_class: string | null;
  }
}
