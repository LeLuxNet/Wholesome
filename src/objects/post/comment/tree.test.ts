import { CommentTree, FullComment } from "../../..";
import { r } from "../../../test/setup";

let c: CommentTree;
beforeAll(async () => {
  c = await r.submission("87").comments();
});

it("should have loaded comments", () => {
  expect(c.loadedComments.length).toBe(33);
});

it("should have all comments", () => {
  expect(c.allComments.length).toBe(84);
});

it("should load all comments", async () => {
  const cs = await c.fetchAll();

  cs.forEach((d) => {
    expect(d === null || d instanceof FullComment).toBeTruthy();
  });

  expect(c.allComments.length).toBe(cs.length);
});

it("should load missing comments", async () => {
  const cs = await c.fetchMissing();

  expect(c.allComments.length - c.loadedComments.length).toBe(cs.length);
});
