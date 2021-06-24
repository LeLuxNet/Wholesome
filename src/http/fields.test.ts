import { fieldInterceptor } from "./fields";

it("should replace field", () => {
  const conf = fieldInterceptor({ url: "a{B}c", fields: { B: "b" } });
  expect(conf.url).toBe("abc");
});

it("should replace multiple fields", () => {
  const conf = fieldInterceptor({
    url: "a{B}c{D}e",
    fields: { B: "b", D: "d" },
  });
  expect(conf.url).toBe("abcde");
});

it("should replace nothing", () => {
  const conf = fieldInterceptor({ url: "def" });
  expect(conf.url).toBe("def");
});

it("should escape", () => {
  const conf = fieldInterceptor({ url: "g{H}i", fields: { H: "/" } });
  expect(conf.url).toBe("g%2Fi");
});

it("should need fields", () => {
  const err = () => fieldInterceptor({ url: "j{K}l" });
  expect(err).toThrow();
});

it("should need all field values", () => {
  const err = () => fieldInterceptor({ url: "j{K}l", fields: {} });
  expect(err).toThrow();
});
