export default interface Embed {
  title: string | null;

  /** Author of the content on the embedded site.
   * This could be a YouTube channel or Twitter user. */
  author: {
    name: string;
    url: string;
  };

  html: string;

  width: number;
  height: number | null;
}
