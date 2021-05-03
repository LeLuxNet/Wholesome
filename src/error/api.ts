export class ApiError extends Error {
  code: string;
  status?: number;
  description?: string;

  constructor(
    code: string,
    message: string,
    status?: number,
    description?: string
  ) {
    const msg = `${message} (${code})`;
    super(description ? `${msg}: ${description}` : msg);

    this.name = "RedditApiError";

    this.code = code;
    this.status = status;
    this.description = description;
  }
}
