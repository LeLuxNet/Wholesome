import { AxiosRequestConfig } from "axios";
import { debugInterceptor } from "./debug";

const log = jest.fn();
global.console.log = log;

it("should log single absolute URL", () => {
  const req: AxiosRequestConfig = {
    method: "get",
    baseURL: "https://example.com",
    url: "https://example.org/index.html",
  };

  const res = debugInterceptor(req);

  expect(log).toBeCalledWith("GET", "https://example.org/index.html");
  expect(res).toStrictEqual(req);
});

it("should log joined URL", () => {
  const req: AxiosRequestConfig = {
    method: "get",
    baseURL: "https://example.com",
    url: "index.html",
  };

  const res = debugInterceptor(req);

  expect(log).toBeCalledWith("GET", "https://example.com/index.html");
  expect(res).toStrictEqual(req);
});
