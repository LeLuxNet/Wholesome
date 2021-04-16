import Identified from "../../interfaces/identified";
import { Image } from "../../media/image";
import Reddit from "../../reddit";
import { User } from "./small";

export class FullUser extends User implements Identified {
  id: string;
  fullId: string;

  displayName: string;
  description: string | null;

  url: string;

  icon: Image;
  avatar: Image | null;
  banner: Image | null;

  created: Date;

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
    this.fullId = `t2_${data.name}`;

    this.displayName = data.subreddit.title || this.name;
    this.description = data.subreddit.public_description || null;

    this.url = `https://reddit.com${data.subreddit.url}`;

    this.icon = {
      native: {
        url: data.subreddit.icon_img,
        width: data.subreddit.icon_size[0],
        height: data.subreddit.icon_size[1],
      },
    };
    this.avatar =
      data.snoovatar_size === null
        ? null
        : {
            native: {
              url: data.snoovatar_img,
              width: data.snoovatar_size[0],
              height: data.snoovatar_size[1],
            },
          };
    this.banner =
      data.subreddit.banner_size === null
        ? null
        : {
            native: {
              url: data.subreddit.banner_img,
              width: data.subreddit.banner_size[0],
              height: data.subreddit.banner_size[1],
            },
          };

    this.created = new Date(data.created_utc * 1000);

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
