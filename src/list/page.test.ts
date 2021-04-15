import Identified from "../interfaces/identified";
import { FullSubmission } from "../objects/post";
import { r } from "../test/setup";
import { unique } from "../utils/array";
import Page, { fetchPage } from "./page";

jest.setTimeout(60 * 1000);

function pageItems(p: Page<Identified, any>) {
  return p.items.map((i) => i.fullId);
}

it("should have right item count", async () => {
  const p = await fetchPage<FullSubmission, Api.SubmissionWrap>(
    r,
    "r/memes/top.json",
    (d) => new FullSubmission(r, d.data),
    205
  );

  expect(pageItems(p).length).toBe(205);
  expect(unique(pageItems(p)).length).toBe(205);
});

it("should get next items", async () => {
  const p = await fetchPage<FullSubmission, Api.SubmissionWrap>(
    r,
    "r/earthporn/top.json",
    (d) => new FullSubmission(r, d.data),
    20
  );

  const p2 = await p.next(20);

  expect(pageItems(p).length + pageItems(p2).length).toBe(
    unique([...pageItems(p), ...pageItems(p2)]).length
  );
});

it("should refetch same items", async () => {
  const p = await fetchPage<FullSubmission, Api.SubmissionWrap>(
    r,
    "r/earthporn/top.json",
    (d) => new FullSubmission(r, d.data),
    80
  );

  const p2 = await p.fetch();

  expect(pageItems(p).length).toBe(
    unique([...pageItems(p), ...pageItems(p2)]).length
  );
});
