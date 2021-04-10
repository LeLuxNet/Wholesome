import Fetchable from "../../interfaces/fetchable";
import Content from "../../media/content";
import GIF from "../../media/gif";
import { Image, Stream, Video } from "../../media/image";
import Poll from "../../media/poll";
import Reddit from "../../reddit";
import FullPost, { DistinguishKinds } from "./full";
import Post from "./small";

export class Submission extends Post implements Fetchable<FullSubmission> {
  constructor(r: Reddit, id: string) {
    super(r, id, `t3_${id}`);
  }

  get shortUrl() {
    return `https://redd.it/${this.id}`;
  }

  async fetch() {
    const res = await this.r.api.get<Api.GetSubmission>("comments/{id}.json", {
      fields: { id: this.id },
    });
    return new FullSubmission(this.r, res.data);
  }

  async follow(follow: boolean = true) {
    this.r.authScope("subscribe");
    await this.r.api.post("api/follow_post", {
      follow,
      fullname: this.fullId,
    });
  }

  async markOc(oc: boolean = true) {
    await this.r.api.post("api/set_original_content", {
      fullname: this.fullId,
      should_set_oc: oc,
    });
  }

  async markNsfw(nsfw: boolean = true) {
    await this.r.api.post(`api/${nsfw ? "" : "un"}marknsfw`, {
      id: this.fullId,
    });
  }

  async markSpoiler(spoiler: boolean = true) {
    await this.r.api.post(`api/${spoiler ? "" : "un"}spoiler`, {
      id: this.fullId,
    });
  }
}

export class FullSubmission extends Submission implements FullPost {
  title: string;

  oc: boolean;
  spoiler: boolean;
  nsfw: boolean;

  saved: boolean;
  archived: boolean;
  locked: boolean;
  stickied: boolean;
  distinguished: DistinguishKinds;

  crosspost: FullSubmission | null;
  crossposts: number;
  crosspostable: boolean;

  link: string;
  body: Content | null;
  thumbnail: Image | null;

  images: Image[];
  gif: GIF | null;
  video: Video | null;
  rpan: Stream | null;

  poll: Poll | null;

  constructor(r: Reddit, full: Api.GetSubmission | Api.Submission) {
    const data = full instanceof Array ? full[0].data.children[0].data : full;
    super(r, data.id);

    this.title = data.title;

    this.oc = data.is_original_content;
    this.spoiler = data.spoiler;
    this.nsfw = data.over_18;

    this.saved = data.saved;
    this.archived = data.archived;
    this.locked = data.locked;
    this.stickied = data.stickied;
    this.distinguished =
      data.distinguished === "moderator" ? "mod" : data.distinguished;

    this.crosspost =
      data.crosspost_parent_list === undefined
        ? null
        : new FullSubmission(r, data.crosspost_parent_list[0]);
    this.crossposts = data.num_crossposts;
    this.crosspostable = data.is_crosspostable;

    this.link = data.url;
    this.body =
      data.selftext_html === null
        ? null
        : {
            markdown: data.selftext,
            html: data.selftext_html,
          };

    this.thumbnail =
      data.thumbnail_width === null
        ? null
        : {
            native: {
              url: data.thumbnail,
              width: data.thumbnail_width,
              height: data.thumbnail_height!,
            },
          };

    this.gif = null;
    this.video = null;

    if (data.preview !== undefined) {
      const img = data.preview.images[0];

      if (img.variants.gif !== undefined) {
        this.gif = {
          gif: mapPreview(img.variants.gif),
          mp4: mapPreview(img.variants.mp4),
        };
        this.images = [this.gif.gif];
        if (data.preview.reddit_video_preview !== undefined) {
          this.video = mapVideo(data.preview.reddit_video_preview);
        }
      } else {
        this.images = [mapPreview(img)];
      }
    } else if ("gallery_data" in data) {
      this.images = data.gallery_data.items.map(
        (i): Image => {
          const img = data.media_metadata[i.media_id];

          return {
            caption: i.caption,
            url: i.outbound_url,
            native: { url: img.s.u, width: img.s.x, height: img.s.y },
            resized: img.p.map((i) => {
              return { url: i.u, width: i.x, height: i.y };
            }),
          };
        }
      );
    } else {
      this.images = [];
    }

    if (data.secure_media) {
      if (!("reddit_video" in data.secure_media))
        console.log(data.secure_media);
      this.video = mapVideo(data.secure_media.reddit_video);
    }

    this.rpan =
      data.rpan_video === undefined ? null : { hls: data.rpan_video.hls_url };

    this.poll =
      data.poll_data === undefined
        ? null
        : {
            prediction: data.poll_data.is_prediction,
            items: data.poll_data.options.map((o) => {
              return { text: o.text, score: o.vote_count };
            }),
            totalScore: data.poll_data.total_vote_count,
          };
  }
}

function mapPreview(img: Api.PreviewImage) {
  return {
    native: {
      url: img.source.url,
      width: img.source.width,
      height: img.source.height,
    },
    resized: img.resolutions.map((i) => {
      return {
        url: i.url,
        width: i.width,
        height: i.height,
      };
    }),
  };
}

function mapVideo(video: Api.Video) {
  const mp4 = video.fallback_url.slice(0, video.fallback_url.indexOf("?"));

  return {
    width: video.width,
    height: video.height,
    hls: video.hls_url,
    dash: video.dash_url,
    mp4: {
      video: mp4,
      audio: mp4.slice(0, mp4.indexOf("DASH")) + "DASH_audio.mp4", //  TODO: Correct audio url
    },
  };
}
