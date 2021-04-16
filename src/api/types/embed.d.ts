/// <reference path="../index.d.ts" />
declare namespace Api {
  export interface Embed {
    provider_url: string;
    url?: string;
    title?: string;
    html: string;
    thumbnail_width?: number;
    author_name: string;
    height: number | null;
    width: number;
    version: string;
    author_url: string;
    provider_name: string;
    thumbnail_url?: string;
    type: "video" | "rich";
    thumbnail_height?: number;
    cache_age?: number;
  }
}
