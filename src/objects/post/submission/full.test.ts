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
  describe("no body", () => {
    var s: FullSubmission;
    beforeAll(async () => (s = await r.submission("ew8evp").fetch()));

    it("should have trimmed body", () => {
      expect(s.body?.markdown).toBe(`\n\n[View Poll](${s.poll?.url})`);
      expect(s.body?.html).toBe(
        `<!-- SC_OFF --><div class="md"><p><a href="${s.poll?.url}">View Poll</a></p>\n</div><!-- SC_ON -->`
      );

      expect(s.poll?.body).toBeNull();
    });

    it("should have options", () => {
      expect(s.poll?.options[0].text).toBe("49ers");
      expect(s.poll?.options[1].text).toBe("Chiefs");
    });

    it("should have right score", () => {
      expect(s.poll?.options[0].score).toBe(4559);
      expect(s.poll?.options[1].score).toBe(4501);
      expect(s.poll?.totalScore).toBe(4559 + 4501);
    });

    it("should have end date", () => {
      expect(s.poll?.endDate).toEqual(new Date("2020-02-02T16:54:55.371Z"));
    });
  });

  describe("body", () => {
    var s: FullSubmission;
    beforeAll(async () => (s = await r.submission("fo7p5b").fetch()));

    it("should have trimmed body", () => {
      expect(s.poll?.body?.markdown.startsWith("If you’re")).toBeTruthy();
      expect(
        s.poll?.body?.markdown.endsWith("how are you feeling?**")
      ).toBeTruthy();

      expect(
        s.poll?.body?.html.startsWith(
          '<!-- SC_OFF --><div class="md"><p>If you’re'
        )
      ).toBeTruthy();
      expect(
        s.poll?.body?.html.endsWith(
          "how are you feeling?</strong></p>\n\n</div><!-- SC_ON -->"
        )
      ).toBeTruthy();
    });
  });
});
