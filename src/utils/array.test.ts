import { unique } from "./array";

it("should have the same items", () => {
  expect(unique([1, 2, 3])).toEqual([1, 2, 3]);
});

it("should have the remove duplicates", () => {
  expect(unique([4, 5, 5, 6])).toEqual([4, 5, 6]);
});

it("should be empty", () => {
  expect(unique([])).toEqual([]);
});
