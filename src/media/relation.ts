import { User } from "../objects/user";

export interface Relation {
  id: string;
  fullId: string;

  user: User;
  since: Date;
}
