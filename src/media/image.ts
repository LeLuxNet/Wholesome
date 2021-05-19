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

  /** The mp4 URL, split up into audio and video. */
  mp4: {
    /** The URL of the video track in mp4 format. */
    video: string;

    /** The URL of the audio track in mp4 format.
     *
     * A request to this URL may result in an 403 status code.
     * In this case the video has no audio.
     */
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

export interface GIF extends Image {
  /** Using the mp4 version of a GIF is in most cases beneficial because of better compression and smaller file sizes.
   *
   *  @example ```html
   * <!-- slow -->
   * <img src={image.native.url} alt={image.caption} />
   *
   * <!-- better -->
   * <video autoplay loop muted>
   *   <source src={image.mp4.native.url} type="video/mp4" />
   * </video>
   * ```
   */
  mp4: Image;
}
