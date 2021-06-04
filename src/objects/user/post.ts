import Reddit from "../../reddit";
import { Flair, flairPart } from "./flair";
import { User } from "./small";

export class PostUser extends User {
  id: string;
  fullId: string;

  premium: boolean;
  /**
   * Whether the user posted this on his cakeday. To get whether the user has
   * cakeday today {@link fetch().cakeday}
   */
  cakeday: boolean;

  flair: Flair | null;

  /** @internal */
  constructor(r: Reddit, data: Api.Submission | Api.Comment) {
    super(r, data.author);

    this.id = data.author_fullname.slice(3);
    this.fullId = data.author_fullname;

    this.premium = data.author_premium;
    this.cakeday = !!data.author_cakeday;

    this.flair = data.author_flair_text_color
      ? {
          text: data.author_flair_text_color,
          background: data.author_flair_background_color,
          parts: data.author_flair_richtext.map(flairPart),
        }
      : null;
  }
}
