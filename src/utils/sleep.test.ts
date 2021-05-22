import { sleep } from "./sleep";

jest.useFakeTimers();

it("should sleep for 10 seconds", () => {
  sleep(10 * 1000);

  expect(setTimeout).toHaveBeenCalledTimes(1);
  expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 10 * 1000);
});
