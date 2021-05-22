import { createReddit } from "../test/setup";
import authInterceptor from "./auth";

const r = createReddit();
r.auth = {
  accessToken: "ACCESS_TOKEN",
  scopes: "*",
};
const interceptor = authInterceptor(r);

it("should add header", () => {
  const res = interceptor({ headers: {} });

  expect(res).toStrictEqual({
    baseURL: "https://oauth.reddit.com",
    headers: { Authorization: "Bearer ACCESS_TOKEN" },
  });
});

it("should skip using skipAuth", () => {
  const res = interceptor({ skipAuth: true });

  expect(res).toStrictEqual({ skipAuth: true });
});

it("should skip auth without auth", () => {
  const res = authInterceptor(createReddit())({});

  expect(res).toStrictEqual({});
});
