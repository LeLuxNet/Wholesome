import Reddit from "../reddit";

export default interface Identified {
  r: Reddit;

  id: string;
  fullId: string;
}
