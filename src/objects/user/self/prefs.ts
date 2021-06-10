export interface Preferences {
  /**
   * The selected language as a IETF language tag (underscore seperated)
   *
   * | native name             | code  |
   * | ----------------------- | ----- |
   * | English                 | en    |
   * | Afrikaans               | af    |
   * | العربية                 | ar    |
   * | Беларуская мова         | be    |
   * | български език          | bg    |
   * | বাংলা                   | bn_IN |
   * | বাংলা                   | bn_bd |
   * | Bosanski                | bs    |
   * | català                  | ca    |
   * | česky                   | cs    |
   * | Cymraeg                 | cy    |
   * | dansk                   | da    |
   * | Deutsch                 | de    |
   * | Ελληνικά                | el    |
   * | English (Australia)     | en_au |
   * | English (Canadian)      | en_ca |
   * | English (Great Britain) | en_gb |
   * | English                 | en_us |
   * | Esperanto               | eo    |
   * | español                 | es    |
   * | español                 | es_ar |
   * | español                 | es_cl |
   * | Español                 | es_mx |
   * | eesti keel              | et    |
   * | Euskara                 | eu    |
   * | فارسی                   | fa    |
   * | suomi                   | fi    |
   * | Filipino                | fil   |
   * | français                | fr    |
   * | Français                | fr_ca |
   * | Frysk                   | fy_NL |
   * | Gaeilge                 | ga_ie |
   * | Gàidhlig                | gd    |
   * | Galego                  | gl    |
   * | עברית                   | he    |
   * | मानक हिन्दी             | hi    |
   * | hrvatski                | hr    |
   * | Magyar                  | hu    |
   * | Հայերեն լեզու           | hy    |
   * | Bahasa Indonesia        | id    |
   * | íslenska                | is    |
   * | italiano (Italy)        | it    |
   * | 日本語                  | ja    |
   * | ಕನ್ನಡ                   | kn_IN |
   * | 한국어                  | ko    |
   * | Latin                   | la    |
   * | 1337                    | leet  |
   * | LOL                     | lol   |
   * | lietuvių kalba          | lt    |
   * | latviešu valoda         | lv    |
   * | Bahasa Melayu           | ms    |
   * | Malti                   | mt_MT |
   * | Nederlands              | nl    |
   * | Nynorsk                 | nn    |
   * | Norsk                   | no    |
   * | Arrrrrrrr!              | pir   |
   * | polski                  | pl    |
   * | português               | pt    |
   * | português               | pt_pt |
   * | português brasileiro    | pt_BR |
   * | română                  | ro    |
   * | русский                 | ru    |
   * | slovenčina              | sk    |
   * | slovenščina             | sl    |
   * | српски језик            | sr    |
   * | Srpski                  | sr_la |
   * | Svenska                 | sv    |
   * | தமிழ்                   | ta    |
   * | ภาษาไทย                 | th    |
   * | Türkçe                  | tr    |
   * | українська мова         | uk    |
   * | Tiếng Việt              | vi    |
   * | 中文                    | zh    |
   * | 简化字                  | zh_cn |
   */
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
  /**
   * If the {@link https://new.reddit.com|redesign} should be used instead of the
   * {@link https://old.reddit.com|original} one
   */
  redesign: boolean;

  /** Whether nightmode should be active in the redesign */
  nightmode: boolean;
}
