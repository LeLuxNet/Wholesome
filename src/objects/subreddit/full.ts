import Identified from "../../interfaces/identified";
import Reddit from "../../reddit";
import Subreddit from "./small";

export default class FullSubreddit extends Subreddit implements Identified {
  r: Reddit;

  id: string;
  fullId: string;

  constructor(r: Reddit, data: Api.Subreddit) {
    super(data.display_name);

    this.r = r;

    this.id = data.id;
    this.fullId = data.name;
  }
}
