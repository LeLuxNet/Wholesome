export class ApiError extends Error {
  code: string;

  constructor(err: Api.Error) {
    super(err[1]);
    this.name = "RedditApiError";
    this.code = err[0];
  }
}
