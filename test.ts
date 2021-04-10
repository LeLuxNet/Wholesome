import axios from "axios";
import sharp from "sharp";
import Reddit, { FullSubmission, Image } from "./src";

declare global {
  namespace jest {
    interface Matchers<R> {
      rightSize(): CustomMatcherResult;
    }
  }
}

expect.extend({
  rightSize: async (image: Image) => {
    const resolution = [image.native];
    if (image.resized !== undefined) {
      resolution.push(...image.resized);
    }

    const res = await Promise.all(
      resolution.map<Promise<jest.CustomMatcherResult>>(async (r) => {
        const res = await axios.get(r.url, { responseType: "arraybuffer" });
        const meta = await sharp(res.data).metadata();

        if (r.width !== meta.width) {
          return {
            pass: false,
            message: () =>
              `Expect image to be ${r.width}px wide not ${meta.width}px`,
          };
        } else if (r.height !== meta.height) {
          return {
            pass: false,
            message: () =>
              `Expect image to be ${r.height}px high not ${meta.height}px`,
          };
        } else {
          return {
            pass: true,
            message: () =>
              `Expect image not to have ${r.width}px wide or ${r.height}px high`,
          };
        }
      })
    );
    return res.find((r) => !r.pass) || res[0];
  },
});

const r = new Reddit({
  userAgent: "",
});

describe("submission", () => {
  describe("image", () => {
    var s: FullSubmission;
    beforeAll(async () => (s = await r.submission("m3gyry").fetch()));

    it("should have image", () => expect(s.images[0]).rightSize());
    it("should have thumbnail", () => expect(s.thumbnail).rightSize());

    it("should have title", () =>
      expect(s.title).toBe("A Monumental Moment, Colorado. [OC] [1280x1600]"));

    it("should have urls", () => {
      expect(s.shortUrl).toBe("https://redd.it/m3gyry");
    });
  });
});
