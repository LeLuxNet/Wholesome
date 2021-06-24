export interface Content {
  /** The content in {@link https://www.reddit.com/wiki/markdown|reddit-flavoured markdown}. */
  markdown: string;

  /**
   * The content rendered to HTML.
   *
   * The content from {@link markdown} rendered to HTML using the
   * old—{@link https://www.reddit.com/wiki/markdown#wiki_differences_between_old_reddit_markdown.2C_new_reddit_markdown.2C_and_commonmark|not all features supporting}—parser.
   */
  html: string;
}
