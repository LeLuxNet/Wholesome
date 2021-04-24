import Self from ".";
import { ar } from "../../../test/setup";

(ar ? describe : describe.skip)("self", () => {
  var s: Self;
  beforeAll(async () => {
    const r = await ar!;
    s = r.self!;
  });

  it("should set preferences", async () => {
    await s.updatePrefs({ nightmode: false });
    var p = await s.prefs();
    expect(p.nightmode).toBe(false);

    await s.updatePrefs({ nightmode: true });
    p = await s.prefs();
    expect(p.nightmode).toBe(true);
  });
});
