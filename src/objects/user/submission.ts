import { User } from ".";
import Reddit from "../../reddit";
import { userFlair, UserFlair } from "./flair";

export class SubmissionUser extends User {
  id: string;
  fullId: string;

  premium: boolean;

  flair: UserFlair[];
  flairText: "light" | "dark";
  flairBackground: string | null;

  constructor(r: Reddit, data: Api.Submission | Api.Comment) {
    super(r, data.author);

    this.id = data.author_fullname.slice(3);
    this.fullId = data.author_fullname;

    this.premium = data.author_premium;

    this.flair = data.author_flair_richtext.map(userFlair);
    this.flairText = data.author_flair_text_color!;
    this.flairBackground = data.author_flair_background_color;
  }
}
