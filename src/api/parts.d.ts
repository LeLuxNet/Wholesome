/// <reference path="./index.d.ts" />
declare namespace Api {
  interface Votable {
    score: number;
    ups: number;
    downs: number;
    likes: boolean | null;
  }

  interface Authored {
    author: string;
    author_fullname?: string;
    author_premium?: boolean;

    author_patreon_flair: false;
    author_flair_css_class: "" | string | null;
    author_flair_richtext: Flair[];
    author_flair_text_color: "dark" | null;
    author_flair_type: FlairType;
    author_flair_text: null;
    author_flair_template_id: null;
    author_flair_background_color: "" | string | null;
  }

  interface Created {
    created: number;
    created_utc: number;
  }
}
