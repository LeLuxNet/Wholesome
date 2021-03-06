import Reddit from "./reddit";

export { Scope } from "./auth/scopes";
export { Page } from "./list/page";
export { Content } from "./media/content";
export { Embed } from "./media/embed";
export {
  BaseImage,
  BaseResolution,
  Dimensions,
  GIF,
  Image,
  Resolution,
  Stream,
  Video,
} from "./media/image";
export { Poll } from "./media/poll";
export { Promotion } from "./media/promotion";
export { Relation } from "./media/relation";
export { Award, GivenAward } from "./objects/award";
export { Collection } from "./objects/collection";
export { Message } from "./objects/message";
export {
  Comment,
  CommentTree,
  FullComment,
  FullSubmission,
  Submission,
} from "./objects/post";
export {
  FullSubreddit,
  ModPermission,
  ModRelation,
  NewSubmissionOptions,
  Requirements,
  Rule,
  Style,
  Subreddit,
  SubredditType,
  Times,
  Traffic,
} from "./objects/subreddit";
export {
  ButtonWidget,
  CalendarWidget,
  CustomWidget,
  FlairWidget,
  IdWidget,
  ImageWidget,
  MenuWidget,
  ModWidget,
  RulesWidget,
  SidebarWidget,
  SubredditsWidget,
  TextWidget,
  Widgets,
} from "./objects/subreddit/widget";
export {
  EmojiFlair,
  Flair,
  FlairPart,
  FullUser,
  PostUser,
  Self,
  TextFlair,
  Trophy,
  User,
} from "./objects/user";
export { Preferences } from "./objects/user/self/prefs";
export { RedditConstructor, UserAgent } from "./reddit";
export { Reddit, Reddit as default };

if (typeof process !== "undefined" && process.browser) {
  global.wholesome = { Reddit };
}
