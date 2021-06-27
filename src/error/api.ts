import { WholesomeError } from "./base";

/** An error thrown by the Reddit API */
export class ApiError extends WholesomeError {
  code: string;
  msg: string;
  status?: number;
  description?: string;

  /** @internal */
  constructor(
    code: string,
    message: string,
    status?: number,
    description?: string
  ) {
    const msg = `${message} (${code})`;
    super("RedditApiError", description ? `${msg}: ${description}` : msg);

    this.code = code;
    this.msg = message;
    this.status = status;
    this.description = description;
  }
}
