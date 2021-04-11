import { Stream } from "stream";
import { upload } from "../../helper/upload";
import Fetchable from "../../interfaces/fetchable";
import Identified from "../../interfaces/identified";
import List from "../../list/list";
import Content from "../../media/content";
import { BaseImage, Image } from "../../media/image";
import Reddit from "../../reddit";
import { FullSubmission, Submission } from "../post/submission";
import { parseRule, Rule } from "./rule";
import { Traffics } from "./traffic";

export class Subreddit implements Fetchable<FullSubreddit> {
  r: Reddit;
  name: string;

  constructor(r: Reddit, name: string) {
    this.r = r;
    this.name = name;
  }

  get url() {
    return `https://www.reddit.com/r/${encodeURIComponent(this.name)}`;
  }

  get stylesheet() {
    return `${this.url}/stylesheet.json`;
  }

  async fetch() {
    const res = await this.r.api.get<Api.SubredditWrap>("r/{name}/about.json", {
      fields: { name: this.name },
    });
    return new FullSubreddit(this.r, res.data.data);
  }

  async rules(): Promise<Rule[]> {
    const res = await this.r.api.get<Api.SubredditRules>(
      "r/{name}/about/rules.json",
      { fields: { name: this.name } }
    );
    return res.data.rules.map(parseRule);
  }

  async traffic(): Promise<Traffics> {
    this.r.authScope("modconfig");
    const res = await this.r.api.get<Api.SubredditTraffic>(
      "r/{name}/about/traffic.json",
      { fields: { name: this.name } }
    );
    return {
      hour: res.data.hour.map((d) => {
        return {
          time: new Date(d[0] * 1000),
          views: d[1],
          uniqueViews: d[2],
        };
      }),
      day: res.data.day.map((d) => {
        return {
          time: new Date(d[0] * 1000),
          views: d[1],
          uniqueViews: d[2],
          joined: d[3],
        };
      }),
      month: res.data.month.map((d) => {
        return {
          time: new Date(d[0] * 1000),
          views: d[1],
          uniqueViews: d[2],
        };
      }),
    };
  }

  async sticky(num: 1 | 2 = 1) {
    const res = await this.r.api.get<Api.GetSubmission>(
      "r/{name}/about/sticky.json",
      { fields: { name: this.name }, params: { num } }
    );
    return new FullSubmission(this.r, res.data);
  }

  async randomSubmission() {
    const res = await this.r.api.get<Api.GetSubmission>(
      "r/{name}/random.json",
      { fields: { name: this.name } }
    );
    return new FullSubmission(this.r, res.data);
  }

  feed(kind: "top") {
    return new List<FullSubmission, Api.SubmissionWrap>(
      this.r,
      `r/${encodeURIComponent(this.name)}/${kind}.json`,
      (d) => new FullSubmission(this.r, d.data)
    );
  }

  submitLink(title: string, url: string, options?: NewSubmissionOptions) {
    return submit(this, title, { kind: "link", url }, options);
  }

  submitText(title: string, body?: string, options?: NewSubmissionOptions) {
    return submit(this, title, { kind: "self", text: body }, options);
  }

  async submitMedia(
    title: string,
    file: Stream,
    name: string,
    mimetype: string,
    options?: NewSubmissionOptions
  ) {
    const url = await upload(this.r, file, name, mimetype);
    this.submitLink(title, url, options);
  }

  submitPoll(
    title: string,
    body: string | undefined,
    items: string[],
    duration: number,
    options?: NewSubmissionOptions
  ) {
    return submit(
      this,
      title,
      { text: body, options: items, duration },
      options,
      "api/submit_poll_post"
    );
  }

  submitCrosspost(
    title: string,
    submission: Submission,
    options?: NewSubmissionOptions
  ) {
    return submit(
      this,
      title,
      { kind: "crosspost", crosspost_fullname: submission.fullId },
      options
    );
  }
}

interface NewSubmissionOptions {
  oc?: boolean;
  nsfw?: boolean;
  spoiler?: boolean;
}
async function submit(
  subreddit: Subreddit,
  title: string,
  data: any,
  options?: NewSubmissionOptions,
  url?: string
) {
  subreddit.r.authScope("submit");
  const res = await subreddit.r.api.post(
    url || "api/submit",
    {
      sr: subreddit.name,
      title,

      spoiler: options?.spoiler,
      nsfw: options?.nsfw,

      ...data,
    },
    {
      headers: {
        "Content-Type": url === undefined ? undefined : "application/json",
      },
    }
  );
  const submission = subreddit.r.submission(res.data.json.data.id);

  if (options?.oc) {
    await submission.markOc();
  }

  return submission;
}

export class FullSubreddit extends Subreddit implements Identified {
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
