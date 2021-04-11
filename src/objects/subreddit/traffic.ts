export interface Traffics {
  hour: Traffic[];
  day: JoinedStamp[];
  month: Traffic[];
}

export interface Traffic {
  time: Date;
  views: number;
  uniqueViews: number;
}

export interface JoinedStamp extends Traffic {
  joined: number;
}
