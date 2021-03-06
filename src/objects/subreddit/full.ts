import { Identified } from "../../interfaces/identified";
import { Content } from "../../media/content";
import { BaseImage, Image } from "../../media/image";
import Reddit from "../../reddit";
import type { Collection } from "../collection";
import { Subreddit } from "./small";

export type SubredditType =
  | "public" /** Everyone can read and post */
  | "publicRestricted" /** Everyone can read; not everyone can post */
  | "private" /** Private */
  | "archived" /** Archived (r/reddit.com) */
  | "premiumOnly" /** Only for users with reddit premium (r/lounge) */
  | "premiumRestricted" /** Everyone can read; only users with reddit premium can post (r/goldbenefits) */
  | "adminOnly" /** Only for reddit admins */;

const subredditTypeMap: { [raw: string]: SubredditType } = {
  public: "public",
  restricted: "publicRestricted",
  private: "private",
  archived: "archived",
  gold_only: "premiumOnly",
  gold_restricted: "premiumRestricted",
  employees_only: "adminOnly",
};

export class FullSubreddit extends Subreddit implements Identified {
  id: string;
  fullId: string;

  title: string;
  shortDescription: Content;
  description: Content;
  type: SubredditType;
  category: string | null;

  memberCount: number;
  activeMemberCount: number;

  icon: Image | null;
  banner: BaseImage | null;

  primaryColor: string | null;
  keyColor: string | null;
  bannerColor: string | null;

  /** The time the subreddit was created at */
  created: Date;
  nsfw: boolean;

  /**
   * The language set for this subreddit in form of a ISO 639-1 code. `en` by default.
   *
   * | native name      | code |
   * | ---------------- | ---- |
   * | Afrikaans        | af   |
   * | العربية          | ar   |
   * | Беларуская мова  | be   |
   * | български език   | bg   |
   * | Bosanski         | bs   |
   * | català           | ca   |
   * | česky            | cs   |
   * | Cymraeg          | cy   |
   * | dansk            | da   |
   * | Deutsch          | de   |
   * | Ελληνικά         | el   |
   * | English          | en   |
   * | Esperanto        | eo   |
   * | español          | es   |
   * | eesti keel       | et   |
   * | Euskara          | eu   |
   * | فارسی            | fa   |
   * | suomi            | fi   |
   * | français         | fr   |
   * | Gàidhlig         | gd   |
   * | Galego           | gl   |
   * | עברית            | he   |
   * | मानक हिन्दी      | hi   |
   * | hrvatski         | hr   |
   * | Magyar           | hu   |
   * | Հայերեն լեզու    | hy   |
   * | Bahasa Indonesia | id   |
   * | íslenska         | is   |
   * | italiano (Italy) | it   |
   * | 日本語           | ja   |
   * | 한국어           | ko   |
   * | Latin            | la   |
   * | lietuvių kalba   | lt   |
   * | latviešu valoda  | lv   |
   * | Bahasa Melayu    | ms   |
   * | Nederlands       | nl   |
   * | Nynorsk          | nn   |
   * | Norsk            | no   |
   * | polski           | pl   |
   * | português        | pt   |
   * | română           | ro   |
   * | русский          | ru   |
   * | slovenčina       | sk   |
   * | slovenščina      | sl   |
   * | српски језик     | sr   |
   * | Svenska          | sv   |
   * | தமிழ்            | ta   |
   * | ภาษาไทย          | th   |
   * | Türkçe           | tr   |
   * | українська мова  | uk   |
   * | Tiếng Việt       | vi   |
   * | 中文             | zh   |
   */
  language: string;

  favorite: boolean;

  hasMenu: boolean;

  /** The text seen on the link submit button in the sidebar */
  submitLinkLabel: string | null;
  /** The text seen on the text submit button in the sidebar */
  submitTextLabel: string | null;
  /** The text visible above the text input on the submit page */
  submitTextText: Content;

  enabledMediaPreview: boolean;
  enabledWiki: boolean;
  enabledEmojis: boolean;
  enabledSpoilers: boolean;
  enabledOc: boolean;

  allowDiscovery: boolean;
  allowGalleries: boolean;
  allowPolls: boolean;
  allowPredictions: boolean;
  allowPredictionsTournament: boolean;
  allowImages: boolean;
  allowGifs: boolean;
  allowVideos: boolean;

  /** @internal */
  constructor(r: Reddit, data: Api.Subreddit) {
    super(r, data.display_name);

    this.id = data.id;
    this.fullId = data.name;

    this.title = data.title;
    this.shortDescription = {
      markdown: data.public_description,
      html: data.public_description_html,
    };
    this.description = {
      markdown: data.description,
      html: data.description_html,
    };
    this.type = subredditTypeMap[data.subreddit_type];
    this.category = data.advertiser_category || null;

    this.memberCount = data.subscribers;
    this.activeMemberCount = data.accounts_active;

    this.icon =
      data.icon_size === null
        ? null
        : {
            native: {
              url: data.icon_img,
              width: data.icon_size[0],
              height: data.icon_size[1],
            },
          };
    this.banner = !data.banner_background_image
      ? null
      : {
          native: {
            url: data.banner_background_image,
          },
        };

    this.primaryColor = data.primary_color || null;
    this.keyColor = data.key_color || null;
    this.bannerColor = data.banner_background_color || null;

    this.created = new Date(data.created_utc * 1000);
    this.nsfw = data.over18;
    this.language = data.lang;

    this.favorite = data.user_has_favorited || false;

    this.hasMenu = data.has_menu_widget;

    this.submitLinkLabel = data.submit_link_label;
    this.submitTextLabel = data.submit_text_label;
    this.submitTextText = {
      markdown: data.submit_text,
      html: data.submit_text_html,
    };

    this.enabledMediaPreview = data.show_media_preview;
    this.enabledWiki = data.wiki_enabled || false;
    this.enabledEmojis = data.emojis_enabled;
    this.enabledSpoilers = data.spoilers_enabled;
    this.enabledOc = data.original_content_tag_enabled;

    this.allowDiscovery = data.allow_discovery;
    this.allowGalleries = data.allow_galleries;
    this.allowPolls = data.allow_polls;
    this.allowPredictions = data.allow_predictions;
    this.allowPredictionsTournament = data.allow_predictions_tournament;
    this.allowImages = data.allow_images;
    this.allowGifs = data.allow_videogifs;
    this.allowVideos = data.allow_videos;
  }

  async collections(): Promise<Collection[]> {
    const data = this.r.api.g<Api.SubmissionCollection[]>(
      "api/v1/collections/subreddit_collections",
      {},
      { sr_fullname: this.fullId }
    );
    const { Collection } = await import("../collection");
    return (await data).map((c) => new Collection(this.r, c));
  }
}
