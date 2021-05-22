import { WholesomeError } from "./base";

export class UnrealSubreddit extends WholesomeError {
  constructor() {
    super(
      "UnrealSubreddit",
      "This function can't be used on unreal or multiple subreddits"
    );
  }
}
