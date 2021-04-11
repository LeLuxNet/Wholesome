/// <reference path="../../index.d.ts" />
declare namespace Api {
  export interface SubredditTraffic {
    day: Traffic[];
    hour: Traffic[];
    month: Traffic[];
  }
}
