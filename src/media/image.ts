interface Dimensions {
  width: number;
  height: number;
}

export interface Stream {
  hls: string;
}

interface BaseResolution {
  url: string;
}

type Resolution = BaseResolution & Dimensions;

export interface Video extends Dimensions, Stream {
  dash: string;
  mp4: {
    video: string;
    audio: string;
  };
}

export interface BaseImage {
  native: BaseResolution;
  resized?: BaseResolution[];

  caption?: string;
  captionLink?: string;
}

export interface Image extends BaseImage {
  native: Resolution;
  resized?: Resolution[];
}
