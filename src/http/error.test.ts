import { AxiosError, AxiosResponse } from "axios";
import { ApiError } from "../error";
import { errorRejectionInterceptor, errorSuccessInterceptor } from "./error";

describe("successInterceptor", () => {
  it("should skip non json body", () => {
    const req = { data: "abc" } as AxiosResponse;
    const res = errorSuccessInterceptor(req);

    expect(res).toStrictEqual(req);
  });

  it("should skip body without errors", () => {
    const req = { data: { json: { errors: [] } } } as AxiosResponse;
    const res = errorSuccessInterceptor(req);

    expect(res).toStrictEqual(req);
  });

  it("should throw error", () => {
    const req = {
      data: { json: { errors: [["CODE", "The message"]] } },
    } as AxiosResponse;

    const fn = () => errorSuccessInterceptor(req);

    expect(fn).toThrow(ApiError);
    expect(fn).toThrow("The message (CODE)");
  });
});

describe("rejectionInterceptor", () => {
  it("should reject without response", () => {
    const err = {} as AxiosError;

    expect(() => errorRejectionInterceptor(err)).rejects.toStrictEqual(err);
  });

  it("should reject non json body", () => {
    const err = { response: { data: "abc" } } as AxiosError;

    expect(() => errorRejectionInterceptor(err)).rejects.toStrictEqual(err);
  });

  it("should reject without error data", () => {
    const err = { response: { data: {} } } as AxiosError;

    expect(() => errorRejectionInterceptor(err)).rejects.toStrictEqual(err);
  });

  it("should throw error", () => {
    const err = {
      response: {
        data: {
          reason: "code",
          message: "The message",
          explanation: "A longer description of the error",
        },
        status: 400,
      },
    } as AxiosError;

    const fn = () => errorRejectionInterceptor(err);

    expect(fn).toThrow(ApiError);
    expect(fn).toThrow("The message (CODE): A longer description of the error");
  });
});
