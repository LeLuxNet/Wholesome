import axios from "axios";
import sharp from "sharp";
import Reddit, { Image } from "..";
import Auth from "../auth";

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

export function createReddit() {
  return new Reddit({
    userAgent: "Wholesome Test",
  });
}

export const r = createReddit();

const { CLIENT_ID, CLIENT_SECRET, USERNAME, PASSWORD } = process.env;
export const ar =
  CLIENT_ID === undefined || CLIENT_SECRET === undefined
    ? undefined
    : createReddit();
if (ar !== undefined) {
  ar.auth = new Auth(ar, {
    client: {
      id: CLIENT_ID!,
      secret: CLIENT_SECRET!,
    },
    auth:
      USERNAME === undefined || PASSWORD === undefined
        ? undefined
        : {
            username: USERNAME,
            password: PASSWORD,
          },
  });
  ar.auth.accessToken.then(console.log);
}
