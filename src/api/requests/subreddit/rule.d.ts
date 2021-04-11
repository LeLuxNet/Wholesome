/// <reference path="../../index.d.ts" />
declare namespace Api {
  export interface SubredditRules {
    rules: Rule[];
    site_rules: string[];
    site_rules_flow: Reason[];
  }
}
