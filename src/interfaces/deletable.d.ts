export default interface Deletable {
  delete(): Promise<void>;
}
