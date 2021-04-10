export default interface Fetchable<T> {
  fetch(): Promise<T>;
}
