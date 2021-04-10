export default interface Poll {
  prediction: boolean;
  items: PollItem[];
  totalScore: number;
}

export interface PollItem {
  text: string;
  score: number;
}
