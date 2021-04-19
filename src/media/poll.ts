import Content from "./content";

export default interface Poll {
  body: Content | null;
  url: string;

  voted: PollOption | null;
  totalScore: number;

  endDate: Date;

  options: PollOption[];

  prediction: boolean;
}

export interface PollOption {
  id: string;
  text: string;

  score: number;
  voted: boolean;
}
