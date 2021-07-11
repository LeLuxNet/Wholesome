import fetch from "node-fetch";
import { stringify } from "querystring";
import { ApiError } from "../error";
import Reddit from "../reddit";

const apiUrl = "https://www.reddit.com";
const apiAuthUrl = "https://oauth.reddit.com";
const graphqlUrl = "https://gql.reddit.com";

export type HTTPMethod = "get" | "post" | "put" | "patch" | "delete";

type APIFields = Record<string, string>;
type APIParams = Record<string, string | number | undefined>;

export interface ApiReq {
  method?: HTTPMethod;
  url?: string;

  fields?: APIFields;
  params?: APIParams;
  skipAuth?: boolean;

  gql?: string;

  data?: any;
}

export class ApiClient {
  r: Reddit;

  debug: boolean;
  userAgent?: string;

  constructor(r: Reddit, debug: boolean, userAgent?: string) {
    this.r = r;

    this.debug = debug;
    this.userAgent = userAgent;
  }

  async exec<T>(req: ApiReq): Promise<T> {
    const leftPadding = 6;

    if (req.gql) {
      if (this.debug) {
        // eslint-disable-next-line no-console
        console.log(" ".repeat(leftPadding), graphqlUrl, req.gql);
      }

      const res = await fetch(graphqlUrl, {
        method: "post",
        headers: {
          Authorization: `Bearer ${this.r.auth?.session?.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: req.gql, variables: req.data }),
      });

      const body: Api.GRes<T> = await res.json();

      if (body.errors) {
        const err = body.errors[0];
        const [code, msg] = err.message.split(":");

        throw new ApiError(code.trimRight(), msg.trimLeft());
      }

      return body.data;
    } else if (req.url) {
      const headers: HeadersInit = {};

      if (this.userAgent) {
        headers["User-Agent"] = this.userAgent;
      }

      req.params ||= {};
      req.params["raw_json"] = "1";

      const auth = !req.skipAuth && this.r.auth;
      if (auth) {
        headers.Authorization = `Bearer ${auth.accessToken}`;
      }

      if (req.data) {
        if (req.method) {
          headers["Content-Type"] = "application/json";
        } else {
          headers["Content-Type"] = "application/x-www-form-urlencoded";
          req.data.api_type = "json";
        }
      }

      let url = req.url.replace(/{([^}]+)}/g, (_, p) => {
        if (req.fields === undefined)
          throw new Error("Fields needed if using template in URL");
        if (req.fields[p] === undefined) throw new Error(`Field '${p}' needed`);

        return encodeURIComponent(req.fields[p]);
      });

      url = `${auth ? apiAuthUrl : apiUrl}/${url}${
        req.data ? "" : ".json"
      }?${stringify(req.params)}`;

      const method = req.method || (req.data ? "post" : "get");

      if (this.debug) {
        // eslint-disable-next-line no-console
        console.log(method.toUpperCase().padEnd(leftPadding), url);
      }

      const res = await fetch(url, {
        method,
        headers,
        body: req.data
          ? req.method
            ? JSON.stringify(req.data)
            : stringify(req.data)
          : undefined,
      });

      const body = await res.json();

      if (res.ok) {
        if (typeof body !== "object") return body;

        const errors: Api.Error[] | undefined = body.json?.errors;
        if (!errors || !errors.length) return body;

        const err = errors[0];
        throw new ApiError(err[0], err[1]);
      } else {
        const err = body as Api.Error2;

        throw new ApiError(
          err.reason.toUpperCase(),
          err.message,
          res.status,
          err.explanation
        );
      }
    }

    throw "Not implemented";
  }

  g<T>(
    url: string,
    fields?: APIFields,
    params?: APIParams,
    skipAuth?: boolean
  ): Promise<T> {
    return this.exec(ApiClient.g(url, fields, params, skipAuth));
  }

  static g(
    url: string,
    fields?: APIFields,
    params?: APIParams,
    skipAuth?: boolean
  ): ApiReq {
    return { url, fields, params, skipAuth };
  }

  p<T>(
    url: string,
    data?: any,
    fields?: APIFields,
    params?: APIParams,
    skipAuth?: boolean
  ): Promise<T> {
    return this.exec(ApiClient.p(url, data, fields, params, skipAuth));
  }

  static p(
    url: string,
    data?: any,
    fields?: APIFields,
    params?: APIParams,
    skipAuth?: boolean
  ): ApiReq {
    return { url, data: data || {}, fields, params, skipAuth };
  }

  json<T>(
    method: HTTPMethod,
    url: string,
    data?: any,
    fields?: APIFields,
    params?: APIParams
  ): Promise<T> {
    return this.exec(ApiClient.json(method, url, data, fields, params));
  }

  static json(
    method: HTTPMethod,
    url: string,
    data?: any,
    fields?: APIFields,
    params?: APIParams
  ): ApiReq {
    return { method, url, data, fields, params };
  }

  gql<T>(id: string, data?: any): Promise<T> {
    return this.exec(ApiClient.gql(id, data));
  }

  static gql(id: string, data?: any): ApiReq {
    return { gql: id, data };
  }
}
