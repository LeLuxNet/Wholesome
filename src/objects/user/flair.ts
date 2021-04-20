import { BaseImage } from "../../media/image";

export interface Flair {
  text: "light" | "dark";
  background: string | null;
  parts: FlairPart[];
}

export type FlairPart = TextFlair | EmojiFlair;

interface TextFlair {
  type: "text";
  content: string;
}

interface EmojiFlair {
  type: "emoji";
  emoji: string;
  image: BaseImage;
}

export function flairPart(f: Api.Flair): FlairPart {
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
