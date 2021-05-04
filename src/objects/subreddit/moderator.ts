import { Relation } from "../../media/relation";

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

export interface ModRelation extends Relation {
  permissions: ModPermission[];
}
