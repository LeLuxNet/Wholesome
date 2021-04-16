import { BaseImage } from "../../media/image";

export type UserFlair = TextFlair | EmojiFlair;

interface TextFlair {
  type: "text";
  content: string;
}

interface EmojiFlair {
  type: "emoji";
  emoji: string;
  image: BaseImage;
}

export function userFlair(f: Api.UserFlair): UserFlair {
  switch (f.e) {
    case "text":
      return {
        type: "text",
        content: f.t,
      };
    case "emoji":
      return {
        type: "emoji",
        emoji: f.a,
        image: {
          native: {
            url: f.u,
          },
        },
      };
  }
}
