import { FullSubmission } from "../../..";
import { r } from "../../../test/setup";

let s: FullSubmission;
beforeAll(async () => (s = await r.submission("msblc3").fetch()));

it("should have correct award count", () => {
  const count = s.awards.map((a) => a.count).reduce((a, b) => a + b);

  expect(s.awardCount).toBe(count);
});

it("should have icons", async () => {
  for (const a of s.awards) {
    await expect(a.icon).rightSize();
  }
});

it("should have tier award", () => {
  const a = s.awards.find(
    (a) => a.id === "award_68ba1ee3-9baf-4252-be52-b808c1e8bdc4"
  )!;

  expect(a.tierIcon(1)).toEqual(a.tierIcon(2));
  expect(a.tierIcon(2)).not.toEqual(a.tierIcon(3));

  expect(a.icon).toBe(a.tierIcon(a.count));
});
