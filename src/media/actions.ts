import { User } from "../objects/user";

export interface Action {
  by: User;
  at: Date;
}
