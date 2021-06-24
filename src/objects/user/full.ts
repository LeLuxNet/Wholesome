import { Identified } from "../../interfaces/identified";
import { Image } from "../../media/image";
import Reddit from "../../reddit";
import { User } from "./small";

export class FullUser extends User implements Identified {
  id: string;
  fullId: string;

  /** The display name a user has set. The normal u/ username is found under {@link name}. */
  displayName: string | null;
  description: string | null;

  icon: Image;
  newAvatar: Image | null;
  banner: Image | null;

  /** The date the profile was created at. */
  created: Date;

  /** Whether the users profile is marked as NSFW. */
  nsfw: boolean;
  /** Whether the user currently has reddit premium/gold. */
  premium: boolean;
  /** Whether the user is a moderator in some subreddit. */
  mod: boolean;
  /** Whether the user is an reddit admin/employee. */
  admin: boolean;

  verifiedEmail: boolean;

  robotIndexable: boolean;

  /**
   * Total karma beeing the sum of {@link submissionKarma}, {@link commentKarma},
   * {@link awardeeKarma} and {@link awarderKarma}
   */
  karma: number;
  /** Karma gotten by upvotes on this users submissions. */
  submissionKarma: number;
  /** Karma gotten by upvotes on this users comments. */
  commentKarma: number;
  /**
   * Karma this user got by **receiving** awards **from** other users. Not to
   * confuse with {@link awarderKarma}.
   */
  awardeeKarma: number;
  /**
   * Karma this user got by **giving** awards **to** other users. Not to confuse
   * with {@link awardeeKarma}.
   */
  awarderKarma: number;

  /** @internal */
  constructor(r: Reddit, data: Api.User) {
    super(r, data.name);

    this.id = data.id;
    this.fullId = `t2_${data.name}`;

    this.displayName = data.subreddit.title || null;
    this.description = data.subreddit.public_description || null;

    this.icon = {
      native: {
        url: data.subreddit.icon_img,
        width: data.subreddit.icon_size[0],
        height: data.subreddit.icon_size[1],
      },
    };
    this.newAvatar =
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

    this.robotIndexable = !data.hide_from_robots;

    this.karma = data.total_karma;
    this.submissionKarma = data.link_karma;
    this.commentKarma = data.comment_karma;
    this.awardeeKarma = data.awardee_karma;
    this.awarderKarma = data.awarder_karma;
  }

  /**
   * Whether the user has cakeday today or the day passed in.
   *
   * @param date The time to check if the user has cakeday at instead of using today.
   */
  hasCakeday(date?: Date): boolean {
    date ||= new Date();
    return (
      this.created.getFullYear() === date.getFullYear() &&
      this.created.getMonth() === date.getMonth() &&
      this.created.getDate() === date.getDate()
    );
  }
}
