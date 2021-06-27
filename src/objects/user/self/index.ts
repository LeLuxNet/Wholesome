import { ApiError } from "../../../error";
import { get, GetOptions } from "../../../list/get";
import { Page } from "../../../list/page";
import { stream, StreamOptions } from "../../../list/stream";
import { Relation } from "../../../media/relation";
import Reddit from "../../../reddit";
import { camelObject2Snake } from "../../../utils/snake";
import { Award } from "../../award";
import { Message } from "../../message";
import { FullSubmission } from "../../post";
import { FullSubreddit } from "../../subreddit";
import { User } from "../small";
import { Preferences } from "./prefs";

type Optional<T> = {
  [K in keyof T]?: T[K];
};

export class Self extends User {
  /** @internal */
  constructor(r: Reddit, name: string | undefined) {
    super(r, name || "");

    if (!name) {
      Object.defineProperty(this, "name", {
        get: () => {
          throw new Error(
            "Your aren't logged in with a username or the 'identity' scope"
          );
        },
      });
    }
  }

  async friends(): Promise<Relation[]> {
    const res = await this.r._api.get<Api.Friends>("prefs/friends.json");
    return res.data[0].data.children.map((r) => ({
      id: r.rel_id.slice(3),
      fullId: r.rel_id,

      user: this.r.user(r.name),
      since: new Date(r.date * 1000),
    }));
  }

  subreddits(options?: GetOptions): Promise<Page<FullSubreddit>> {
    this.r.needScopes("mysubreddits");
    return get<FullSubreddit, Api.SubredditWrap>(
      this.r,
      { url: "subreddits/mine/subscriber" },
      (d) => new FullSubreddit(this.r, d.data),
      options
    );
  }

  subredditsStream(options?: StreamOptions): AsyncIterable<FullSubreddit> {
    this.r.needScopes("mysubreddits");
    return stream<FullSubreddit, Api.SubredditWrap>(
      this.r,
      { url: "subreddits/mine/subscriber" },
      (d) => new FullSubreddit(this.r, d.data),
      options
    );
  }

  messages(options?: GetOptions): Promise<Page<Message>> {
    this.r.needScopes("privatemessages");
    return get<Message, Api.MessageWrap>(
      this.r,
      { url: "message/inbox" },
      (d) => new Message(this.r, d.data),
      options
    );
  }

  messagesStream(options?: StreamOptions): AsyncIterable<Message> {
    this.r.needScopes("privatemessages");
    return stream<Message, Api.MessageWrap>(
      this.r,
      { url: "message/inbox" },
      (d) => new Message(this.r, d.data),
      options
    );
  }

  /** Marks all messages as read */
  async setMessagesRead(): Promise<void> {
    this.r.needScopes("privatemessages");
    await this.r._api.post("api/read_all_messages");
  }

  voted(dir: 1 | -1, options?: GetOptions): Promise<Page<FullSubmission>> {
    return get<FullSubmission, Api.Submission>(
      this.r,
      {
        url: `user/{name}/${dir === -1 ? "down" : "up"}voted`,
        fields: { name: this.name },
      },
      (d) => new FullSubmission(this.r, d),
      options
    );
  }

  votedStream(
    dir: 1 | -1,
    options?: StreamOptions
  ): AsyncIterable<FullSubmission> {
    return stream<FullSubmission, Api.Submission>(
      this.r,
      {
        url: `user/{name}/${dir === -1 ? "down" : "up"}voted`,
        fields: { name: this.name },
      },
      (d) => new FullSubmission(this.r, d),
      options
    );
  }

  saved(options?: GetOptions): Promise<Page<FullSubmission>> {
    return get<FullSubmission, Api.Submission>(
      this.r,
      { url: "user/{name}/saved", fields: { name: this.name } },
      (d) => new FullSubmission(this.r, d),
      options
    );
  }

  savedStream(options?: StreamOptions): AsyncIterable<FullSubmission> {
    return stream<FullSubmission, Api.Submission>(
      this.r,
      { url: "user/{name}/saved", fields: { name: this.name } },
      (d) => new FullSubmission(this.r, d),
      options
    );
  }

  hidden(options?: GetOptions): Promise<Page<FullSubmission>> {
    return get<FullSubmission, Api.Submission>(
      this.r,
      { url: "user/{name}/hidden", fields: { name: this.name } },
      (d) => new FullSubmission(this.r, d),
      options
    );
  }

  hiddenStream(options?: StreamOptions): AsyncIterable<FullSubmission> {
    return stream<FullSubmission, Api.Submission>(
      this.r,
      { url: "user/{name}/hidden", fields: { name: this.name } },
      (d) => new FullSubmission(this.r, d),
      options
    );
  }

  async prefs(): Promise<Preferences> {
    this.r.needScopes("identity");
    const { data } = await this.r._api.get<Api.Prefs>("api/v1/me/prefs");

    return {
      language: data.lang,

      newWindow: data.newwindow,

      mediaThumbnail:
        data.media === "on" ? true : data.media === "off" ? false : "subreddit",
      mediaPreview:
        data.media_preview === "on"
          ? true
          : data.media_preview === "off"
          ? false
          : "subreddit",
      mediaPreviewNsfw: !data.no_profanity,
      mediaAutoplay: data.video_autoplay,

      showTrending: data.show_trending,
      showRecent: data.clickgadget,
      showDomain: data.domain_details,
      hideUpvoted: data.hide_ups,
      hideDownvoted: data.hide_downs,
      hideAds: data.hide_ads,
      pageSize: data.numsites,
      submissionMinScore: data.min_link_score,

      commentSort:
        data.default_comment_sort === "confidence"
          ? "best"
          : data.default_comment_sort,
      commentIgnoreSugestedSort: data.ignore_suggested_sort,
      commentHighlightNew: data.highlight_new_comments,
      commentHighlightControversial: data.highlight_controversial,
      commentMinScore: data.min_comment_score,

      notifications: data.live_orangereds,

      threadedMessages: data.threaded_messages,
      threadedModmail: data.threaded_modmail,
      collapseReadMessages: data.collapse_read_messages,
      markReadMessages: data.mark_messages_read,
      notifyMention: data.monitor_mentions,
      welcomeMessages: data.send_welcome_messages,
      allowMessages: data.accept_pms,

      emailMessage: data.email_messages,
      emailChat: data.email_chat_request,
      emailSubmissionReply: data.email_post_reply,
      emailSubmissionUpvote: data.email_upvote_post,
      emailCommentReply: data.email_comment_reply,
      emailCommentUpvote: data.email_upvote_comment,
      emailMention: data.email_username_mention,
      emailFollower: data.email_user_new_follower,
      emailDigest: data.email_digests,
      emailNone: data.email_unsubscribe_all,

      showStyles: data.show_stylesheets,
      showUserFlair: data.show_flair,
      showSubmissionFlair: data.show_link_flair,
      legacySearch: data.legacy_search,

      nsfw: data.over_18,
      nsfwSearch: data.search_include_over_18,
      privateFeeds: data.private_feeds,

      publicVotes: data.public_votes,
      research: data.research,
      showTwitter: data.show_twitter,
      showRemainingPremium: data.show_gold_expiration,
      showPresence: data.show_presence,

      robotIndexable: !data.hide_from_robots,
      clickTracking: data.allow_clicktracking,
      activityAds: data.activity_relevant_ads,
      thirdPartyDataAds: data.third_party_data_personalized_ads,
      thirdPartyActivityAds: data.third_party_site_data_personalized_ads,
      thirdPartyActivityRecommendations:
        data.third_party_site_data_personalized_content,

      autorenewPremium: data.creddit_autorenew,

      beta: data.beta,
      redesign: data.in_redesign_beta,

      nightmode: data.nightmode,
    };
  }

  async updatePrefs(prefs: Optional<Preferences>): Promise<void> {
    this.r.needScopes("account");

    const data: { [K in keyof Api.Prefs]: Api.Prefs[K] | undefined } = {
      lang: prefs.language,

      newwindow: prefs.newWindow,

      media: prefs.mediaThumbnail
        ? prefs.mediaThumbnail === "subreddit"
          ? "subreddit"
          : "on"
        : "off",
      media_preview: prefs.mediaPreview
        ? prefs.mediaPreview === "subreddit"
          ? "subreddit"
          : "on"
        : "off",
      no_profanity:
        prefs.mediaPreviewNsfw === undefined
          ? undefined
          : !prefs.mediaPreviewNsfw,
      video_autoplay: prefs.mediaAutoplay,

      show_trending: prefs.showTrending,
      clickgadget: prefs.showRecent,
      domain_details: prefs.showDomain,
      hide_ups: prefs.hideUpvoted,
      hide_downs: prefs.hideDownvoted,
      hide_ads: prefs.hideAds,
      min_link_score: prefs.submissionMinScore,

      default_comment_sort:
        prefs.commentSort === "best" ? "confidence" : prefs.commentSort,
      ignore_suggested_sort: prefs.commentIgnoreSugestedSort,
      highlight_new_comments: prefs.commentHighlightNew,
      highlight_controversial: prefs.commentHighlightControversial,
      min_comment_score: prefs.commentMinScore,

      live_orangereds: prefs.notifications,

      threaded_modmail: prefs.threadedModmail,
      threaded_messages: prefs.threadedMessages,
      collapse_read_messages: prefs.collapseReadMessages,
      mark_messages_read: prefs.markReadMessages,
      monitor_mentions: prefs.notifyMention,
      send_welcome_messages: prefs.welcomeMessages,
      accept_pms: prefs.allowMessages,

      email_messages: prefs.emailMessage,
      email_chat_request: prefs.emailChat,
      email_post_reply: prefs.emailSubmissionReply,
      email_upvote_post: prefs.emailSubmissionUpvote,
      email_comment_reply: prefs.emailCommentReply,
      email_upvote_comment: prefs.emailCommentUpvote,
      email_username_mention: prefs.emailMention,
      email_user_new_follower: prefs.emailFollower,
      email_digests: prefs.emailDigest,
      email_unsubscribe_all: prefs.emailNone,

      show_stylesheets: prefs.showStyles,
      show_flair: prefs.showUserFlair,
      show_link_flair: prefs.showSubmissionFlair,
      legacy_search: prefs.legacySearch,

      over_18: prefs.nsfw,
      search_include_over_18: prefs.nsfwSearch,
      private_feeds: prefs.privateFeeds,

      public_votes: prefs.publicVotes,
      research: prefs.research,
      show_twitter: prefs.showTwitter,
      show_gold_expiration: prefs.showRemainingPremium,
      show_presence: prefs.showPresence,

      hide_from_robots:
        prefs.robotIndexable === undefined ? undefined : !prefs.robotIndexable,
      allow_clicktracking: prefs.clickTracking,
      activity_relevant_ads: prefs.activityAds,
      third_party_data_personalized_ads: prefs.thirdPartyActivityAds,
      third_party_personalized_ads: prefs.thirdPartyDataAds,
      third_party_site_data_personalized_ads: prefs.thirdPartyActivityAds,
      third_party_site_data_personalized_content:
        prefs.thirdPartyActivityRecommendations,

      creddit_autorenew: prefs.autorenewPremium,

      beta: prefs.beta,
      in_redesign_beta: prefs.redesign,

      nightmode: prefs.nightmode,

      // dead
      organic: undefined,
      theme_selector: undefined,
      profile_opt_out: undefined,
      enable_default_themes: undefined,
      other_theme: undefined,
      survey_last_seen_time: undefined,

      // missing
      compress: undefined,
      email_private_message: undefined,
      feed_recommendations_enabled: undefined,
      g: undefined,
      label_nsfw: undefined,
      num_comments: undefined,
      numsites: undefined,
      send_crosspost_messages: undefined,
      show_location_based_recommendations: undefined,
      show_promote: undefined,
      store_visits: undefined,
      top_karma_subreddits: undefined,
      use_global_defaults: undefined,
    };

    await this.r._api.patch("api/v1/me/prefs", data, {
      headers: { "Content-Type": "application/json" },
    });
  }

  async hasFreeAward(): Promise<boolean> {
    const { econSpecialEvents: data } =
      await this.r.api.gql<Api.FreeAwardCheck>("7537a71b4f14");

    return data.freeAwardEvent.isEnabled;
  }

  async claimFreeAward(): Promise<Award | null> {
    let data: Api.FreeAwardClaim;
    try {
      data = await this.r.api.gql<Api.FreeAwardClaim>("7264b2ee2ded", {
        input: { offerId: "free_awards" },
      });
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.code === "INVALID_REQUEST" &&
        err.msg === "User is not eligible"
      ) {
        return null;
      }

      throw err;
    }

    const a: Api.GAward = camelObject2Snake(
      data.claimAwardOffer.awards[0]
    ) as any;

    return new Award(a);
  }
}
