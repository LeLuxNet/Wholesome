/** The error class representing errors thrown by Wholesome */
export class WholesomeError extends Error {
  /** @internal */
  constructor(name: string, message: string) {
    super(message);
    this.name = name;
  }
}
