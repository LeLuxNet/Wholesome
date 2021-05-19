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
    [id: string]: MediaImage | MediaGIF;
  }

  interface MediaImageBase {
    status: "valid";
    m: string;
    p: MediaResolution[];
    id: string;
  }

  interface MediaImage extends MediaImageBase {
    e: "Image";
    s: MediaResolution;
  }

  interface MediaGIF extends MediaImageBase {
    e: "AnimatedImage";
    s: MediaGIFResolution;
  }

  export interface MediaResolution {
    y: number; // height
    x: number; // width
    u: string;
  }

  export interface MediaGIFResolution {
    y: number; // height
    x: number; // width
    gif: string;
    mp4: string;
  }
}
