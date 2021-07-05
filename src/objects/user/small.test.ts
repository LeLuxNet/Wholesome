import { r } from "../../test/setup";

it("should be available", async () => {
  // No user with this username should exist
  const name = "0LMWzlfoR82sqRSDkaFY";

  expect(await r.user(name).nameAvailable()).toBe(true);
});

it("should not be available", async () =>
  expect(await r.user("LeLuxNetBot").nameAvailable()).toBe(false));
