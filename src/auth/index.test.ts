import Auth from ".";
import { createReddit } from "../test/setup";

const { CLIENT_ID, CLIENT_SECRET } = process.env;

(CLIENT_ID === undefined || CLIENT_SECRET === undefined ? it.skip : it)(
  "should get access token",
  async () => {
    const r = createReddit();
    r.auth = new Auth(r, {
      client: {
        id: CLIENT_ID!,
        secret: CLIENT_SECRET!,
      },
    });

    const a = await r.auth.accessToken;

    expect(a).toBeDefined();
  }
);
