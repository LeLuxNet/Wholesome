export interface Dimensions {
  /** The width in pixels */
  width: number;
  /** The height in pixels */
  height: number;
}

export interface Stream {
  /** The {@link https://en.wikipedia.org/wiki/HTTP_Live_Streaming|HLS} URL */
  hls: string;
}

export interface BaseResolution {
  /** The URL of the image */
  url: string;
}

export type Resolution = BaseResolution & Dimensions;

export interface Video extends Dimensions, Stream {
  /** The {@link https://en.wikipedia.org/wiki/Dynamic_Adaptive_Streaming_over_HTTP|DASH} URL */
  dash: string;

  /** The mp4 URL, split up into {@link mp4.audio} and {@link mp4.video}. */
  mp4: {
    /** The URL of the mp4 video file without audio */
    video: string;
    /** The URL of the mp4 video file with only audio */
    audio: string;
  };

  /** The duration of the video in seconds */
  duration: number;

  /** The video bitrate in kbps */
  bitrate: number;
}

export interface BaseImage {
  /** The native resolution of the image */
  native: BaseResolution;
  /** The resized versions of the image in different resolutions */
  resized?: BaseResolution[];

  /** The image captions */
  caption?: string;
  /** The link next to the {@link caption|captions} */
  captionLink?: string;
}

export interface Image extends BaseImage {
  native: Resolution;
  resized?: Resolution[];
}
