import { FullUser } from "../..";
import { r } from "../../test/setup";

var u: FullUser;
beforeAll(async () => (u = await r.user("LeLuxNetBot").fetch()));

it("should have display name", () => expect(u.displayName).toBe("LeLuxNetBot"));

it("should have icon", () => expect(u.icon).rightSize());

it("should have url", () =>
  expect(u.url).toBe(`https://www.reddit.com/user/LeLuxNetBot`));
