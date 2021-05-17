import { Collection } from "../..";
import { r } from "../../test/setup";

let c: Collection;
beforeAll(async () => {
  c = await r.collection("84359211-be58-4c98-87cd-26bc10c59fb3");
});

it("should have title", () => expect(c.title).toBe("searching for starman"));

it("should have description", () => expect(c.description).toBe("series of 4"));

it("should have author", () => expect(c.author.name).toBe("3dsf"));

it("should have subreddit", () => expect(c.subreddit.name).toBe("MagicEye"));

it("should have creation date", () => {
  expect(c.created).toEqual(new Date("2019-06-25T05:07:53.164Z"));
});

it("should have update date", () => {
  expect(c.updated).toEqual(new Date("2019-06-26T14:18:58.233Z"));
});
