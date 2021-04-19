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

describe("poll", () => {
  var s: FullSubmission;
  beforeAll(async () => (s = await r.submission("mtvjk4").fetch()));

  it("should have trimmed body", () => {
    expect(s.body?.markdown).toBe(`Poll Body\n\n[View Poll](${s.poll?.url})`);
    expect(s.body?.html).toBe(
      `<!-- SC_OFF --><div class="md"><p>Poll Body</p>\n\n<p><a href="${s.poll?.url}">View Poll</a></p>\n</div><!-- SC_ON -->`
    );

    expect(s.poll?.body?.markdown).toBe("Poll Body");
    expect(s.poll?.body?.html).toBe(
      `<!-- SC_OFF --><div class="md"><p>Poll Body</p>\n\n</div><!-- SC_ON -->`
    );
  });

  it("should have end date", () =>
    expect(s.poll?.endDate).toEqual(new Date("2021-04-23T07:37:44.711Z")));
});
