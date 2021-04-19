import Identified from "../../interfaces/identified";
import Content from "../../media/content";
import { BaseImage, Image } from "../../media/image";
import Reddit from "../../reddit";
import Subreddit from "./small";

export default class FullSubreddit extends Subreddit implements Identified {
  id: string;
  fullId: string;

  title: string;
  shortDescription: Content;
  description: Content;
  category: string | null;

  memberCount: number;
  activeMemberCount: number;

  icon: Image | null;
  banner: BaseImage | null;

  primaryColor: string | null;
  keyColor: string | null;
  bannerColor: string | null;

  created: Date;
  nsfw: boolean;
  language: string;

  favorite: boolean;

  hasMenu: boolean;

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
}
