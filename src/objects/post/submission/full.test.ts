import { FullSubmission } from "../../..";
import { r } from "../../../test/setup";

describe("image", () => {
  var s: FullSubmission;
  beforeAll(async () => (s = await r.submission("m3gyry").fetch()));

  it("should have image", () => expect(s.images[0]).rightSize());
  it("should have thumbnail", () => expect(s.thumbnail).rightSize());

  it("should have title", () => {
    expect(s.title).toBe("A Monumental Moment, Colorado. [OC] [1280x1600]");
  });

  it("should have subreddit", () => expect(s.subreddit.name).toBe("EarthPorn"));

  it("should have urls", () => {
    expect(s.shortUrl).toBe("https://redd.it/m3gyry");
  });
});
