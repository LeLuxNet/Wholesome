/// <reference path="../index.d.ts" />
declare namespace Api {
  interface Preview {
    images: PreviewVariants[];
    reddit_video_preview?: Video;
    enabled: true;
  }

  interface PreviewVariants extends PreviewImage {
    variants: {
      [type: string]: PreviewImage;
    };
    id: string;
  }

  export interface PreviewImage {
    source: Image;
    resolutions: Image[];
  }
}
