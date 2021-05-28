import Content from "./content";

export default interface Poll {
  body: Content | null;
  url: string;

  /** The option you have voted for {@see PollOption.voted} */
  voted: PollOption | null;
  totalScore: number;

  /** The time this poll ends and no more votes can be casted */
  endDate: Date;

  options: PollOption[];

  prediction: boolean;
}

export interface PollOption {
  id: string;
  /** The content of this option */
  text: string;

  /** The number of users who voted for this */
  score: number;
  /** Whether you have voted this option */
  voted: boolean;
}
