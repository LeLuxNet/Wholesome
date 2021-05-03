export interface Requirements {
  guideline: string | null;

  titleLengthMin: number | null;
  titleLengthMax: number | null;
  titleRequired: string[];
  titleBlacklist: string[];
  titleRegexes: string[];

  bodyLengthMin: number | null;
  bodyLengthMax: number | null;
  bodyRequired: string[];
  bodyBlacklist: string[];
  bodyRegexes: string[];

  domainBlacklist: string[] | null;
  domainWhitelist: string[] | null;
}
