import Reddit from "..";
import { FullSubmission } from "../objects/post/submission";
import { unique } from "../utils/array";
import { fetchPage } from "./page";

jest.setTimeout(60 * 1000);

const r = new Reddit({ userAgent: "" });

it("should have right item count", async () => {
  const p = await fetchPage<FullSubmission, Api.Submission>(
    r,
    "r/memes/top.json",
    (d) => new FullSubmission(r, d),
    205
  );

  expect(p.items.length).toBe(205);
  expect(unique(p.items).length).toBe(205);
});

it("should get next items", async () => {
  const p = await fetchPage<FullSubmission, Api.Submission>(
    r,
    "r/earthporn/top.json",
    (d) => new FullSubmission(r, d),
    20
  );

  const p2 = await p.next(20);

  expect(p.items.length + p2.items.length).toBe(
    unique([...p.items, ...p2.items]).length
  );
});
