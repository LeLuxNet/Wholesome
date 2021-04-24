export interface Preferences {
  /** The selected language as a IETF language tag (underscore seperated) */
  language: string;

  /** Whether it should open links in a new windows */
  newWindow: boolean;

  mediaThumbnail: boolean | "subreddit";
  mediaPreview: boolean | "subreddit";
  /** If `false` NSFW media should be previewed blurred */
  mediaPreviewNsfw: boolean;
  /** Whether video should autoplay */
  mediaAutoplay: boolean;

  showTrending: boolean;
  showRecent: boolean;
  showDomain: boolean;
  /** Hide submission you already upvoted */
  hideUpvoted: boolean;
  /** Hide submission you already downvoted */
  hideDownvoted: boolean;
  hideAds: boolean;
  pageSize: number;
  /** Hide submissions with a score below this */
  submissionMinScore: number;

  commentSort:
    | "best"
    | "old"
    | "top"
    | "qa"
    | "controversial"
    | "new"
    | "random"
    | "live";
  commentIgnoreSugestedSort: boolean;
  commentHighlightNew: boolean;
  commentHighlightControversial: boolean;
  /** Hide comments with a score below this */
  commentMinScore: number;

  notifications: boolean;

  threadedMessages: boolean;
  threadedModmail: boolean;
  collapseReadMessages: boolean;
  markReadMessages: boolean;
  notifyMention: boolean;
  welcomeMessages: boolean;
  allowMessages: "everyone" | "whitelisted";

  emailMessage: boolean;
  emailChat: boolean;
  emailSubmissionReply: boolean;
  emailSubmissionUpvote: boolean;
  emailCommentReply: boolean;
  emailCommentUpvote: boolean;
  emailMention: boolean;
  emailFollower: boolean;
  emailDigest: boolean;
  emailNone: boolean;

  /** Allow subreddits to show their custom theme */
  showStyles: boolean;
  /** Show flair next to their username */
  showUserFlair: boolean;
  /** Show flair next to the submission */
  showSubmissionFlair: boolean;
  legacySearch: boolean;

  /** Show NSFW content */
  nsfw: boolean;
  /** Allow NSFW content to show up in the search results */
  nsfwSearch: boolean;
  /** Enable RSS and JSON feeds accessible on {@link https://www.reddit.com/prefs/feeds} */
  privateFeeds: boolean;

  /** Allow other users to see your upvoted and downvoted feed */
  publicVotes: boolean;
  /** Allow your data to be used for research purposes */
  research: boolean;
  /** Allow search engines to index your profile */
  showTwitter: boolean;
  showRemainingPremium: boolean;
  showPresence: boolean;

  robotIndexable: boolean;
  clickTracking: boolean;
  activityAds: boolean;
  thirdPartyDataAds: boolean;
  thirdPartyActivityAds: boolean;
  thirdPartyActivityRecommendations: boolean;

  autorenewPremium: boolean;

  /** Whether you take part in the beta */
  beta: boolean;
  /** If the {@link https://new.reddit.com|redesign} should be used instead of the {@link https://old.reddit.com|original} one */
  redesign: boolean;

  /** Whether nightmode should be active in the redesign */
  nightmode: boolean;
}
