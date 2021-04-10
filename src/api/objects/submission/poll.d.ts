/// <reference path="../../index.d.ts" />
declare namespace Api {
  export interface Poll {
    user_selection: null;
    total_stake_amount: null;
    voting_end_timestamp: number;
    total_vote_count: number;
    user_won_amount: null;
    is_prediction: boolean;
    resolved_option_id: null;
    options: PollOption[];
    tournament_id: null;
  }

  interface PollOption {
    text: string;
    vote_count: number;
    id: string;
  }
}
