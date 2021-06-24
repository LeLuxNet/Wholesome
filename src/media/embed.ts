export interface Embed {
  title: string | null;

  /**
   * Author of the content on the embedded site. This could be a YouTube channel
   * or Twitter user.
   */
  author: {
    name: string;
    url: string;
  };

  /**
   * The HTML containing the content to embed. This could be an IFrame (YouTube)
   * or the content directly (Twitter).
   */
  html: string;

  width: number;
  height: number | null;
}
