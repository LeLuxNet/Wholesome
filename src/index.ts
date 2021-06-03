import Reddit from "./reddit";
export { Scope } from "./auth/scopes";
export { default as Page } from "./list/page";
export { default as Content } from "./media/content";
export { default as Embed } from "./media/embed";
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
export { default as Poll } from "./media/poll";
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
  Self,
  SubmissionUser,
  TextFlair,
  Trophy,
  User,
} from "./objects/user";
export { Preferences } from "./objects/user/self/prefs";
export { RedditConstructor } from "./reddit";
export { Reddit };
export default Reddit;

if (typeof process !== "undefined" && process.browser) {
  global.wholesome = { Reddit };
}
