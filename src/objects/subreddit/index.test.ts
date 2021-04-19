import { FullSubreddit } from "../..";
import { r } from "../../test/setup";

describe("basic", () => {
  var s: FullSubreddit;
  beforeAll(async () => {
    s = await r.subreddit("gifs").fetch();
  });

  it("should have name", () => expect(s.name).toBe("gifs"));

  it("should have url", () =>
    expect(s.url).toBe("https://www.reddit.com/r/gifs"));
  it("should have stylesheet", () =>
    expect(s.stylesheet).toBe("https://www.reddit.com/r/gifs/stylesheet.json"));

  it("should have icon", () => expect(s.icon).rightSize());

  it("should allow gifs", () => {
    expect(s.allowGalleries).toBe(false);
    expect(s.allowVideos).toBe(false);
    expect(s.allowPolls).toBe(false);

    expect(s.allowImages).toBe(true);
    expect(s.allowGifs).toBe(true);
  });
});

describe("style", () => {
  var s: FullSubreddit;
  beforeAll(async () => {
    s = await r.subreddit("dankmemes").fetch();
  });

  it("should have custom style", async () => {
    const st = await s.style();
    const voteButtons = [
      st.upvoteInactive,
      st.upvoteActive,
      st.downvoteInactive,
      st.downvoteActive,
    ];

    voteButtons.forEach((i) =>
      expect(
        i?.native.url.startsWith(
          "https://styles.redditmedia.com/t5_2zmfe/styles/post"
        )
      ).toBeTruthy()
    );
  });
});
