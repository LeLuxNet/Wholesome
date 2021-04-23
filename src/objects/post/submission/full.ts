import { get, GetOptions } from "../../../list/get";
import { stream, StreamCallback, StreamOptions } from "../../../list/stream";
import Action from "../../../media/actions";
import Content from "../../../media/content";
import Embed from "../../../media/embed";
import Event from "../../../media/event";
import GIF from "../../../media/gif";
import { Image, Stream, Video } from "../../../media/image";
import Poll, { PollOption } from "../../../media/poll";
import Promotion from "../../../media/promotion";
import Reddit from "../../../reddit";
import { Collection } from "../../collection";
import { Subreddit } from "../../subreddit";
import { SubmissionUser } from "../../user";
import { Flair, flairPart } from "../../user/flair";
import FullPost, { DistinguishKinds } from "../full";
import { VoteDirection } from "../small";
import { GivenAward } from "./award";
import Submission from "./small";

export default class FullSubmission extends Submission implements FullPost {
  /** The title of the submission. */
  title: string;

  /** The user who posted this submission or null if he's 'u/[deleted]' */
  author: SubmissionUser | null;

  /** The subreddit this submission was posted on. */
  subreddit: Subreddit;

  /** The date submission was created. */
  created: Date;
  /** The date this submission body was edited or `null` if it wasn't. */
  edited: Date | null;

  /** The URL this submission can be accessed. To get the link this submission container see {@link link}. */
  url: string;

  /** The *fuzzed* score the submission has or `null` if it's {@link scoreHidden|hidden}. */
  score: number | null;
  /** Whether the score is hidden. */
  scoreHidden: boolean;
  upvoteRatio: number;
  /** The vote the user casted on this submission. Use {@link vote} to change it. */
  voted: VoteDirection;

  awardCount: number;
  awards: GivenAward[];

  oc: boolean;
  spoiler: boolean;
  nsfw: boolean;

  flair: Flair | null;

  robotIndexable: boolean;

  commentCount: number;

  saved: boolean;
  hidden: boolean;
  pinned: boolean;
  archived: boolean;
  locked: boolean;
  stickied: boolean;
  quarantine: boolean;
  distinguished: DistinguishKinds;

  deleted: boolean;
  approved: Action | null;
  removed: Action | null;

  /** The crosspost this submission contains */
  crosspost: FullSubmission | null;

  /**
   * How often this submission has been crossposted
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

  body: Content | null;
  thumbnail: Image | null;

  images: Image[];
  gif: GIF | null;
  video: Video | null;
  rpan: Stream | null;

  poll: Poll | null;
  embed: Embed | null;
  promoted: Promotion | null;

  /** @internal */
  constructor(r: Reddit, data: Api.Submission) {
    super(r, data.id);

    this.title = data.title;

    this.author =
      data.author_fullname === undefined ? null : new SubmissionUser(r, data);
    this.subreddit = r.subreddit(data.subreddit);

    this.created = new Date(data.created_utc * 1000);
    this.edited = data.edited ? new Date(data.edited * 1000) : null;

    this.url = r.linkUrl + data.permalink;

    this.score = data.hide_score ? null : data.score;
    this.scoreHidden = data.hide_score;
    this.upvoteRatio = data.upvote_ratio;
    this.voted = data.likes === null ? 0 : data.likes ? 1 : -1;

    this.awardCount = data.total_awards_received;
    this.awards = data.all_awardings.map((a) => new GivenAward(a));

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

    this.saved = data.saved;
    this.hidden = data.hidden;
    this.pinned = data.pinned;
    this.archived = data.archived;
    this.locked = data.locked;
    this.stickied = data.stickied;
    this.quarantine = data.quarantine;
    this.distinguished =
      data.distinguished === "moderator" ? "mod" : data.distinguished;

    this.deleted = this.author === null;
    this.approved =
      data.approved_by === null
        ? null
        : {
            by: r.user(data.approved_by),
            at: new Date(data.approved_at_utc! * 1000),
          };
    this.removed =
      data.banned_by === null
        ? null
        : {
            by: r.user(data.banned_by),
            at: new Date(data.banned_at_utc! * 1000),
          };

    this.crosspost =
      data.crosspost_parent_list === undefined
        ? null
        : new FullSubmission(r, data.crosspost_parent_list[0]);
    this.crosspostCount = data.num_crossposts;
    this.crosspostable = data.is_crosspostable;

    this.collections = data.collections
      ? data.collections.map((c) => new Collection(this.r, c))
      : [];

    this.event = data.event_start
      ? {
          from: new Date(data.event_start * 1000),
          to: new Date(data.event_end! * 1000),
          isLive: data.event_is_live!,
        }
      : null;

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

    this.gif = null;
    this.video = null;
    this.embed = null;

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
            captionLink: i.outbound_url,
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
      var body: Content | null = null;
      if (this.body) {
        const htmlParts = this.body.html.split("\n");
        htmlParts.splice(-2, 1);

        body = {
          markdown: this.body.markdown.split("\n").slice(0, -2).join("\n"),
          html: htmlParts.join("\n"),
        };
      }
      const userVote = data.poll_data.user_selection;
      var voted: PollOption | null = null;

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

    this.promoted = data.call_to_action
      ? { button: data.call_to_action }
      : null;
  }

  /**
   * Returns all crossposts of this submission
   * @see {@link crosspostsStream}
   */
  crossposts(options?: CrosspostsOptions) {
    return this.duplicates({ ...options, crosspostsOnly: true });
  }

  /**
   * @param fn function that gets called once a new crosspost arrives
   */
  crosspostsStream(
    fn: StreamCallback<FullSubmission>,
    options?: CrosspostsStreamOptions
  ) {
    return this.duplicatesStream(fn, { ...options, crosspostsOnly: true });
  }

  /**
   * Returns all duplicates of this submission
   * @see {@link duplicatesStream}
   */
  duplicates(options?: DuplicatesOptions) {
    return get<FullSubmission, Api.SubmissionWrap>(
      this.r,
      {
        url: "duplicates/{id}.json",
        fields: { id: this.id },
        params: {
          crossposts_only: options?.crosspostsOnly ? 1 : undefined,
          sort: options?.sort === "new" ? "new" : "num_comments",
          sr: options?.sub ? options.sub.name : undefined,
        },
      },
      (d) => new FullSubmission(this.r, d.data),
      options
    );
  }

  /**
   * @param fn function that gets called once a new duplicate arrives
   */
  duplicatesStream(
    fn: StreamCallback<FullSubmission>,
    options?: DuplicatesStreamOptions
  ) {
    return stream<FullSubmission, Api.SubmissionWrap>(
      this.r,
      {
        url: "duplicates/{id}.json",
        fields: { id: this.id },
        params: {
          crossposts_only: options?.crosspostsOnly ? 1 : undefined,
          sort: "new",
          sr: options?.sub ? options.sub.name : undefined,
        },
      },
      (d) => new FullSubmission(this.r, d.data),
      fn,
      options
    );
  }
}

export type CrosspostsStreamOptions = StreamOptions & { sub?: Subreddit };

export type CrosspostsOptions = GetOptions & {
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

function mapVideo(video: Api.Video) {
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
  };
}
