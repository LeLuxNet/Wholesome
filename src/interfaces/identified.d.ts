import Reddit from "../reddit";

export interface Identified {
  r: Reddit;

  /** The ID of this thing */
  id: string;

  /**
   * The {@link id} starting with the corresponding prefix
   *
   * | Prefix | Thing              |
   * | ------ | ------------------ |
   * | `t1_`  | {@link Comment}    |
   * | `t2_`  | {@link User}       |
   * | `t3_`  | {@link Submission} |
   * | `t4_`  | {@link Message}    |
   * | `t5_`  | {@link Subreddit}  |
   * | `t6_`  | {@link Award}      |
   */
  fullId: string;
}
