import { createReddit } from "../test/setup";

const { CLIENT_ID, CLIENT_SECRET } = process.env;

(CLIENT_ID === undefined || CLIENT_SECRET === undefined ? it.skip : it)(
  "should get access token",
  async () => {
    const r = createReddit();
    await r.login({
      client: {
        id: CLIENT_ID as string,
        secret: CLIENT_SECRET as string,
      },
    });

    expect(r.auth?.accessToken).toBeDefined();
  }
);
