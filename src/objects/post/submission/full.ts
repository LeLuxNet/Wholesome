import { ApiClient } from "../../../http/api";
import { aPage } from "../../../list/apage";
import { Page, PageOptions } from "../../../list/page";
import { stream, StreamOptions } from "../../../list/stream";
import { Content } from "../../../media/content";
import { Embed } from "../../../media/embed";
import { Event } from "../../../media/event";
import { GIF, Image, Stream, Video } from "../../../media/image";
import { Poll, PollOption } from "../../../media/poll";
import { Promotion } from "../../../media/promotion";
import Reddit from "../../../reddit";
import { Collection } from "../../collection";
import { Subreddit } from "../../subreddit";
import { Flair, flairPart } from "../../user/flair";
import { FullPost } from "../full";
import { Submission, _Submission } from "./small";

export class FullSubmission
  extends _Submission(FullPost)
  implements Submission
{
  /** The title of the submission. */
  title: string;

  /**
   * The upvote percentage calculated using
   * $\frac{\text{upvotes}}{\text{upvotes}+\text{downvotes}}$.
   */
  upvoteRatio: number;

  /**
   * Whether this submission is marked as OC
   *
   * @see {@link setOc}
   */
  oc: boolean;
  /**
   * Whether this submission is marked as a spoiler
   *
   * @see {@link setSpoiler}
   */
  spoiler: boolean;
  /**
   * Whether this submission is marked as NSFW
   *
   * @see {@link setNsfw}
   */
  nsfw: boolean;

  flair: Flair | null;

  robotIndexable: boolean;

  /**
   * The count of all comments (not only top level comments).
   *
   * @see {@link comments}
   */
  commentCount: number;

  hidden: boolean;
  quarantine: boolean;

  /** The crosspost this submission contains */
  crosspost: FullSubmission | null;

  /**
   * How often this submission has been crossposted to other subreddits
   *
   * @see {@link crossposts} to fetch them
   */
  crosspostCount: number;

  /** Whether the subreddit allows this submission to be crossposted */
  crosspostable: boolean;

  /** The collections this submission is a part of */
  collections: Collection[];

  event: Event | null;

  link: string | null;
  rawLink: string;

  /**
   * The submission body.
   *
   * @see {@link edit}
   */
  body: Content | null;
  thumbnail: Image | null;

  images: (Image | GIF)[];
  video: Video | null;
  rpan: Stream | null;

  poll: Poll | null;
  embed: Embed | null;
  promoted: Promotion | null;

  /** @internal */
  constructor(r: Reddit, data: Api.Submission) {
    super(r, data, data.hide_score);

    this.title = data.title;

    this.upvoteRatio = data.upvote_ratio;

    this.oc = data.is_original_content;
    this.spoiler = data.spoiler;
    this.nsfw = data.over_18;

    this.flair = data.link_flair_richtext.length
      ? {
          text: data.link_flair_text_color,
          background: data.link_flair_background_color,
          parts: data.link_flair_richtext.map(flairPart),
        }
      : null;

    this.robotIndexable = data.is_robot_indexable;

    this.commentCount = data.num_comments;

    this.hidden = data.hidden;
    this.quarantine = data.quarantine;

    this.crosspost =
      data.crosspost_parent_list === undefined
        ? null
        : new FullSubmission(r, data.crosspost_parent_list[0]);
    this.crosspostCount = data.num_crossposts;
    this.crosspostable = data.is_crosspostable;

    this.collections = data.collections
      ? data.collections.map((c) => new Collection(this.r, c))
      : [];

    this.event =
      data.event_start === undefined
        ? null
        : {
            from: new Date(data.event_start * 1000),
            to: new Date(data.event_end! * 1000),
            isLive: data.event_is_live!,
          };

    this.link =
      data.is_reddit_media_domain ||
      data.url === `https://www.reddit.com${data.permalink}`
        ? null
        : data.url;
    this.rawLink = data.url;

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

    this.video = null;
    this.embed = null;

    if (data.preview !== undefined) {
      const img = data.preview.images[0];

      if (img.variants.gif !== undefined) {
        this.images = [
          {
            ...mapPreview(img.variants.gif),
            mp4: mapPreview(img.variants.mp4),
          },
        ];
        if (data.preview.reddit_video_preview !== undefined) {
          this.video = mapVideo(data.preview.reddit_video_preview);
        }
      } else {
        this.images = [mapPreview(img)];
      }
    } else if ("gallery_data" in data) {
      this.images = data.gallery_data.items.map((i): Image => {
        const img = data.media_metadata[i.media_id];

        const res = {
          caption: i.caption,
          captionLink: i.outbound_url,
          native: {
            url: "u" in img.s ? img.s.u : img.s.gif,
            width: img.s.x,
            height: img.s.y,
          },
          resized: img.p.map((i) => {
            return { url: i.u, width: i.x, height: i.y };
          }),
        };

        if ("mp4" in img.s) {
          (<GIF>res).mp4 = {
            native: { url: img.s.mp4, width: img.s.x, height: img.s.y },
          };
        }

        return res;
      });
    } else {
      this.images = [];
    }

    if (data.secure_media) {
      if ("reddit_video" in data.secure_media) {
        this.video = mapVideo(data.secure_media.reddit_video);
      } else if ("oembed" in data.secure_media) {
        const e = data.secure_media.oembed;
        this.embed = {
          title: e.title || null,
          author: {
            name: e.author_name,
            url: e.author_url,
          },

          html: e.html,

          width: e.width,
          height: e.height,
        };
      }
    }

    this.rpan =
      data.rpan_video === undefined ? null : { hls: data.rpan_video.hls_url };

    this.poll = null;
    if (data.poll_data) {
      let body: Content | null = null;
      if (this.body) {
        const htmlParts = this.body.html.split("\n");
        if (htmlParts.length !== 2) {
          htmlParts.splice(-2, 1);

          body = {
            markdown: this.body.markdown.split("\n").slice(0, -2).join("\n"),
            html: htmlParts.join("\n"),
          };
        }
      }

      const userVote = data.poll_data.user_selection;
      let voted: PollOption | null = null;

      const options = data.poll_data.options.map((o) => {
        const option = {
          id: o.id,
          text: o.text,
          score: o.vote_count,
          voted: o.id === userVote,
        };
        if (option.voted) voted = option;
        return option;
      });

      this.poll = {
        body,
        url: `${this.r.linkUrl}/poll/${encodeURIComponent(this.id)}`,

        voted,
        totalScore: data.poll_data.total_vote_count,

        endDate: new Date(data.poll_data.voting_end_timestamp),

        options,

        prediction: data.poll_data.is_prediction,
      };
    }

    this.promoted = data.promoted
      ? { button: data.call_to_action || null }
      : null;
  }

  /**
   * Returns all crossposts of this submission
   *
   * @see {@link crosspostsStream}
   */
  crossposts(options?: CrosspostsOptions): Promise<Page<FullSubmission>> {
    return this.duplicates({ ...options, crosspostsOnly: true });
  }

  crosspostsStream(
    options?: CrosspostsStreamOptions
  ): AsyncIterable<FullSubmission> {
    return this.duplicatesStream({ ...options, crosspostsOnly: true });
  }

  /**
   * Returns all duplicates of this submission
   *
   * @see {@link duplicatesStream}
   */
  duplicates(options?: DuplicatesOptions): Promise<Page<FullSubmission>> {
    return aPage<FullSubmission, Api.SubmissionWrap>(
      {
        r: this.r,
        req: ApiClient.g(
          "duplicates/{id}",
          { id: this.id },
          {
            crossposts_only: options?.crosspostsOnly ? 1 : undefined,
            sort: options?.sort === "new" ? "new" : "num_comments",
            sr: options?.sub ? options.sub.name : undefined,
          }
        ),
        mapItem: (d) => new FullSubmission(this.r, d.data),
      },
      options
    );
  }

  duplicatesStream(
    options?: DuplicatesStreamOptions
  ): AsyncIterable<FullSubmission> {
    return stream<FullSubmission, Api.SubmissionWrap>(
      this.r,
      ApiClient.g(
        "duplicates/{id}",
        { id: this.id },
        {
          crossposts_only: options?.crosspostsOnly ? 1 : undefined,
          sort: "new",
          sr: options?.sub ? options.sub.name : undefined,
        }
      ),
      (d) => new FullSubmission(this.r, d.data),
      options
    );
  }
}

export type CrosspostsStreamOptions = StreamOptions & { sub?: Subreddit };

export type CrosspostsOptions = PageOptions & {
  sub?: Subreddit;
  sort?: "new" | "commentCount";
};

export type DuplicatesStreamOptions = CrosspostsStreamOptions & {
  crosspostsOnly?: boolean;
};

export type DuplicatesOptions = CrosspostsOptions & {
  crosspostsOnly?: boolean;
};

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

function mapVideo(video: Api.Video): Video {
  const mp4 = video.fallback_url.slice(0, video.fallback_url.indexOf("?"));

  return {
    width: video.width,
    height: video.height,
    hls: video.hls_url,
    dash: video.dash_url,
    mp4: {
      video: mp4,
      audio: mp4.slice(0, mp4.indexOf("DASH")) + "DASH_audio.mp4",
    },
    duration: video.duration,
    bitrate: video.bitrate_kbps,
  };
}
