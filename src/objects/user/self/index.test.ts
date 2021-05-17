import Self from ".";
import { ar } from "../../../test/setup";

(ar ? describe : describe.skip)("self", () => {
  let s: Self;
  beforeAll(async () => {
    const r = await ar!;
    s = r.self!;
  });

  it("should set preferences", async () => {
    await s.updatePrefs({ nightmode: false });
    let p = await s.prefs();
    expect(p.nightmode).toBe(false);

    await s.updatePrefs({ nightmode: true });
    p = await s.prefs();
    expect(p.nightmode).toBe(true);
  });

  it("should add and remove friend", async () => {
    const u = (await ar!).user("ginnyTheCar");

    await u.friend(false);
    let friends = await s.friends();
    expect(friends.find((f) => f.user.is(u))).toBeUndefined();

    await u.friend();
    friends = await s.friends();
    expect(friends.find((f) => f.user.is(u))).toBeDefined();

    await u.friend(false);
  });
});
