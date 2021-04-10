import Reddit from "../../reddit";
import User from "./small";

export default class FullUser extends User {
  id: string;

  displayName: string;
  description: string | null;

  url: string;

  nsfw: boolean;
  premium: boolean;
  mod: boolean;
  admin: boolean;

  verifiedEmail: boolean;

  karma: number;
  submissionKarma: number;
  commentKarma: number;
  awardeeKarma: number;
  awarderKarma: number;

  constructor(r: Reddit, data: Api.User) {
    super(r, data.name);

    this.id = data.id;

    this.displayName = data.subreddit.title || this.name;
    this.description = data.subreddit.public_description || null;

    this.url = `https://reddit.com${data.subreddit.url}`;

    this.nsfw = data.subreddit.over_18;
    this.premium = data.is_gold;
    this.mod = data.is_mod;
    this.admin = data.is_employee;

    this.verifiedEmail = data.has_verified_email;

    this.karma = data.total_karma;
    this.submissionKarma = data.link_karma;
    this.commentKarma = data.comment_karma;
    this.awardeeKarma = data.awardee_karma;
    this.awarderKarma = data.awarder_karma;
  }
}
