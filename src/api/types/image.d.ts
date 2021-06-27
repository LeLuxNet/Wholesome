/// <reference path="../index.d.ts" />
declare namespace Api {
  export interface BaseImage {
    url: string;
  }

  export interface Image extends BaseImage {
    width: number;
    height: number;
  }
}
