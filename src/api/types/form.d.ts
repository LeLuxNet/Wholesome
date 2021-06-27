/// <reference path="../index.d.ts" />
declare namespace Api {
  export interface FormWrap<T> {
    json: {
      data: T;
    };
  }
}
