import { FullSubreddit } from ".";
import { r } from "../../test/setup";

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
