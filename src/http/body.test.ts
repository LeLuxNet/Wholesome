import { AxiosRequestConfig } from "axios";
import bodyInterceptor from "./body";

it("should skip GET", () => {
  const req: AxiosRequestConfig = { method: "GET" };

  const res = bodyInterceptor(req);
  expect(res).toStrictEqual(req);
});

it("should skip explicit Content-Type", () => {
  const req: AxiosRequestConfig = {
    headers: { "Content-Type": "application/json" },
    data: { some: "data" },
  };

  const res = bodyInterceptor(req);
  expect(res).toStrictEqual(req);
});

it("should skip without body", () => {
  const req: AxiosRequestConfig = {};

  const res = bodyInterceptor(req);
  expect(res).toStrictEqual(req);
});

it("should transform body", () => {
  const res = bodyInterceptor({ data: { a: 1, b: "2", c: true } });
  expect(res).toStrictEqual({ data: "a=1&b=2&c=true&api_type=json" });
});
