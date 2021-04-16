import Action from "../../../media/actions";
import Content from "../../../media/content";
import GIF from "../../../media/gif";
import { Image, Stream, Video } from "../../../media/image";
import Poll from "../../../media/poll";
import Reddit from "../../../reddit";
import { Subreddit } from "../../subreddit";
import { SubmissionUser } from "../../user";
import FullPost, { DistinguishKinds } from "../full";
import { VoteDirection } from "../small";
import { GivenAward } from "./award";
import Submission from "./small";

export default class FullSubmission extends Submission implements FullPost {
  title: string;

  author: SubmissionUser | null;
  subreddit: Subreddit;

  created: Date;
  edited: Date | null;

  url: string;

  score: number;
  upvoteRatio: number;
  voted: VoteDirection;

  awardCount: number;
  awards: GivenAward[];

  oc: boolean;
  spoiler: boolean;
  nsfw: boolean;

  robotIndexable: boolean;

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

  commentCount: number;

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

    this.author =
      data.author_fullname === undefined
        ? null
        : new SubmissionUser(this.r, data);
    this.subreddit = r.subreddit(data.subreddit);

    this.created = new Date(data.created_utc * 1000);
    this.edited = data.edited ? new Date(data.edited * 1000) : null;

    this.url = `https://reddit.com${data.permalink}`;

    this.score = data.score;
    this.upvoteRatio = data.upvote_ratio;
    this.voted = data.likes === null ? 0 : data.likes ? 1 : -1;

    this.awardCount = data.total_awards_received;
    this.awards = data.all_awardings.map((a) => new GivenAward(a));

    this.oc = data.is_original_content;
    this.spoiler = data.spoiler;
    this.nsfw = data.over_18;

    this.robotIndexable = data.is_robot_indexable;

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

    this.commentCount = data.num_comments;

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
