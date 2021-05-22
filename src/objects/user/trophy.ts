import { Image } from "../../media/image";
import Reddit from "../../reddit";

export class Trophy {
  name: string;
  description: string | null;

  url: string | null;

  icon: Image;

  /** @internal */
  constructor(r: Reddit, data: Api.Trophy) {
    this.name = data.name;
    this.description = data.description;

    this.url =
      data.url === null
        ? null
        : data.url.startsWith("/")
        ? r.linkUrl + data.url
        : data.url;

    this.icon = {
      native: {
        url: data.icon_70,
        width: 71,
        height: 71,
      },
      resized: [
        {
          url: data.icon_40,
          width: 41,
          height: 41,
        },
      ],
    };
  }
}
