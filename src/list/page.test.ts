import Identified from "../interfaces/identified";
import { FullSubmission } from "../objects/post";
import { r } from "../test/setup";
import { unique } from "../utils/array";
import Page, { fetchPage } from "./page";

jest.setTimeout(60 * 1000);

function pageItems(p: Page<Identified, any>) {
  return p.items.map((i) => i.fullId);
}

var page: Page<FullSubmission>;
beforeAll(async () => {
  page = await fetchPage<FullSubmission, Api.SubmissionWrap>(
    r,
    { url: "r/earthporn/top.json" },
    (d) => new FullSubmission(r, d.data),
    20
  );
});

it("should have right item count", async () => {
  const p = await fetchPage<FullSubmission, Api.SubmissionWrap>(
    r,
    { url: "r/memes/top.json" },
    (d) => new FullSubmission(r, d.data),
    205
  );

  expect(pageItems(p).length).toBe(205);
  expect(unique(pageItems(p)).length).toBe(205);
});

it("should get next items", async () => {
  const p2 = await page.next(20);

  expect(pageItems(page).length + pageItems(p2).length).toBe(
    unique([...pageItems(page), ...pageItems(p2)]).length
  );
});

it("should refetch same items", async () => {
  const p2 = await page.fetch();

  expect(pageItems(page).length).toBe(
    unique([...pageItems(page), ...pageItems(p2)]).length
  );
});

it("should be able to call next multiple times", async () => {
  var p = await fetchPage<FullSubmission, Api.SubmissionWrap>(
    r,
    { url: "r/earthporn/top.json" },
    (d) => new FullSubmission(r, d.data),
    5
  );

  for (let i = 0; i < 10; i++) {
    p = await p.next(5);
  }
});

it("should have no previous items", async () => {
  var p = await fetchPage<FullSubmission, Api.SubmissionWrap>(
    r,
    { url: "r/earthporn/top.json" },
    (d) => new FullSubmission(r, d.data),
    5
  );

  const p2 = await p.prev(10);

  expect(p.items.length).toBe(5);
  expect(p2.items.length).toBe(0);
});

it("should be able to load more after empty page", async () => {
  const p2 = await page.prev(10);
  expect(p2.items.length).toBe(0);

  const p3 = await p2.prev(10);
  expect(p3.items.length).toBe(0);
});
