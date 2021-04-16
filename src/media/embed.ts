export default interface Embed {
  title: string | null;
  author: {
    name: string;
    url: string;
  };

  html: string;

  width: number;
  height: number | null;
}
