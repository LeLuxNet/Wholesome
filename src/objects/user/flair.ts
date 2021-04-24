import { BaseImage } from "../../media/image";

export interface Flair {
  /** Light or dark text color based on the {@link background} color */
  text: "light" | "dark";

  /** The background color of the flair */
  background: string | null;

  parts: FlairPart[];
}

export type FlairPart = TextFlair | EmojiFlair;

export interface TextFlair {
  type: "text";
  content: string;
}

export interface EmojiFlair {
  type: "emoji";
  /** The emoji name surrounded by colons */
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
