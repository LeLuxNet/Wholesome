export type DistinguishKinds = "mod" | "admin" | "special" | null;

export default interface FullPost {
  saved: boolean;
  archived: boolean;
  locked: boolean;
  stickied: boolean;
  distinguished: DistinguishKinds;
}
