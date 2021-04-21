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

  export interface Moderator {
    name: string;
    author_flair_text: string | null;
    mod_permissions: ModPermission[];
    date: number;
    rel_id: string;
    id: string;
    author_flair_css_class: string | null;
  }
}
