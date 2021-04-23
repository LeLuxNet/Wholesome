import { Image } from "../../media/image";

export class Trophy {
  name: string;
  description: string | null;

  url: string | null;

  icon: Image;

  /** @internal */
  constructor(data: Api.Trophy) {
    this.name = data.name;
    this.description = data.description;

    this.url =
      data.url === null
        ? null
        : data.url.startsWith("/")
        ? `https://www.reddit.com${data.url}`
        : data.url;

    this.icon = {
      native: {
        url: data.icon_70,
        width: 70,
        height: 70,
      },
      resized: [
        {
          url: data.icon_40,
          width: 40,
          height: 40,
        },
      ],
    };
  }
}
