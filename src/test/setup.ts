import axios from "axios";
import sharp from "sharp";
import Reddit, { Image } from "..";

declare global {
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Matchers<R> {
      rightSize(): CustomMatcherResult;
    }
  }
}

jest.setTimeout(30 * 1000);

export async function getSize(url: string): Promise<[number, number]> {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  const meta = await sharp(res.data).metadata();
  return [meta.width!, meta.height!];
}

expect.extend({
  rightSize: async (image: Image) => {
    const resolution = [image.native];
    if (image.resized !== undefined) {
      resolution.push(...image.resized);
    }

    const res = await Promise.all(
      resolution.map<Promise<jest.CustomMatcherResult>>(async (r) => {
        const [width, height] = await getSize(r.url);

        if (r.width !== width || r.height !== height) {
          return {
            pass: false,
            message: () =>
              `Expect image from ${r.url} to be ${r.width}x${r.height}px not ${width}x${height}px`,
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

export function createReddit(): Reddit {
  return new Reddit({
    userAgent: "Wholesome Test",
  });
}

export const r = createReddit();

const { CLIENT_ID, CLIENT_SECRET, USERNAME, PASSWORD } = process.env;
export const ar: Promise<Reddit> | undefined =
  CLIENT_ID && CLIENT_SECRET && USERNAME && PASSWORD
    ? Promise.resolve(createReddit()).then(async (r) => {
        await r.login({
          client: { id: CLIENT_ID!, secret: CLIENT_SECRET! },
          auth: { username: USERNAME!, password: PASSWORD! },
        });
        return r;
      })
    : undefined;
