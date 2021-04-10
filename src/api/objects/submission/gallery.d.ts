/// <reference path="../../index.d.ts" />
declare namespace Api {
  interface Gallery {
    items: GalleryItem[];
  }

  interface GalleryItem {
    caption?: string;
    outbound_url?: string;
    media_id: string;
    id: string;
  }

  interface MediaMetadata {
    [id: string]: {
      status: "valid";
      e: "Image";
      m: string;
      p: MediaImage[];
      s: MediaImage;
      id: string;
    };
  }
}
