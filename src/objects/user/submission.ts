import Reddit from "../../reddit";
import { Flair, flairPart } from "./flair";
import { User } from "./small";

export class SubmissionUser extends User {
  id: string;
  fullId: string;

  premium: boolean;

  flair: Flair | null;

  constructor(r: Reddit, data: Api.Submission | Api.Comment) {
    super(r, data.author);

    this.id = data.author_fullname.slice(3);
    this.fullId = data.author_fullname;

    this.premium = data.author_premium;

    this.flair = data.author_flair_text_color
      ? {
          text: data.author_flair_text_color,
          background: data.author_flair_background_color,
          parts: data.author_flair_richtext.map(flairPart),
        }
      : null;
  }
}
