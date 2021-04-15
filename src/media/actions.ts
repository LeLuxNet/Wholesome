import { User } from "../objects/user";

export default interface Action {
  by: User;
  at: Date;
}
