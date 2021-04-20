import axios from "axios";
import sharp from "sharp";
import Reddit, { Image } from "..";

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

        if (r.width !== meta.width || r.height !== meta.height) {
          return {
            pass: false,
            message: () =>
              `Expect image from ${r.url} to be ${r.width}x${r.height}px not ${meta.width}x${meta.height}px`,
          };
        } else {
          return {
            pass: true,
            message: () =>
              `Expect image from ${r.url} not to be ${r.width}x${r.height}px`,
          };
        }
      })
    );

    return res.find((r) => !r.pass) || res[0];
  },
});

export function createReddit() {
  return new Reddit({
    userAgent: "Wholesome Test",
  });
}

export const r = createReddit();

const { CLIENT_ID, CLIENT_SECRET, USERNAME, PASSWORD } = process.env;
export var ar: Promise<Reddit> | undefined =
  CLIENT_ID && CLIENT_SECRET && USERNAME && PASSWORD
    ? Promise.resolve(createReddit())
    : undefined;
if (ar) {
  ar = ar.then(async (r) => {
    await r.login({
      client: { id: CLIENT_ID!, secret: CLIENT_SECRET! },
      auth: { username: USERNAME!, password: PASSWORD! },
    });
    return r;
  });
}
