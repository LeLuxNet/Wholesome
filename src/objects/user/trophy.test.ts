import { r } from "../../test/setup";
import { Trophy } from "./trophy";

let trophies: Trophy[];
beforeAll(async () => (trophies = await r.user("LeLuxNetBot").trophies()));

it("should have 1 trophy", () => expect(trophies.length).toBe(1));

it("should have verified email", async () => {
  const t = trophies[0];
  expect(t).toBeDefined();

  expect(t.name).toBe("Verified Email");
  expect(t.description).toBeNull();
  expect(t.url).toBeNull();
});

it("should have right sizes", async () => {
  for (const t of trophies) {
    await expect(t.icon).rightSize();
  }
});
