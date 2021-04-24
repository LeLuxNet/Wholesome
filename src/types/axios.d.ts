declare module "axios/lib/helpers/buildURL" {
  export default function buildURL(
    url: string,
    params: any,
    paramsSerializer?: (params: any) => string
  ): string;
}

declare module "axios/lib/helpers/combineURLs" {
  export default function combineURLs(
    baseURL: string,
    relativeURL: string
  ): string;
}

declare module "axios/lib/helpers/isAbsoluteURL" {
  export default function isAbsoluteURL(url: string): boolean;
}
