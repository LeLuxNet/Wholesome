/// <reference path="../index.d.ts" />
declare namespace Api {
  export interface ErrorResponse {
    json: {
      errors: Error[];
    };
  }

  export type Error = [code: string, message: string, field: string];

  export interface Error2 {
    reason: string;
    message: string;
    explanation?: string;
    error?: number;
  }
}
