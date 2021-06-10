export interface Requirements {
  /** Text visible on the submit page. */
  guideline: string | null;

  /**
   * The min length of the submission title.
   *
   * @see {@link titleLengthMax} {@link bodyLengthMin}
   */
  titleLengthMin: number | null;
  /**
   * The max length of the submission title.
   *
   * @see {@link titleLengthMax} {@link bodyLengthMax}
   */
  titleLengthMax: number | null;
  /**
   * A list of strings the submission title has to contain.
   *
   * @see {@link bodyRequired}
   */
  titleRequired: string[];
  /**
   * A list of strings not allowed to occur in the title.
   *
   * @see {@link bodyBlacklist}
   */
  titleBlacklist: string[];
  /**
   * A list of Python-flavored regexes. The title has to match one of them.
   *
   * @see {@link bodyRegexes}
   */
  titleRegexes: string[];

  /**
   * The min length of the submission body.
   *
   * @see {@link bodyLengthMax} {@link titleLengthMin}
   */
  bodyLengthMin: number | null;
  /**
   * The max length of the submission body.
   *
   * @see {@link bodyLengthMin} {@link titleLengthMax}
   */
  bodyLengthMax: number | null;
  /**
   * A list of strings the submission body has to contain.
   *
   * @see {@link titleRequired}
   */
  bodyRequired: string[];
  /**
   * A list of strings not allowed to occur in the body.
   *
   * @see {@link titleBlacklist}
   */
  bodyBlacklist: string[];
  /**
   * A list of Python-flavored regexes. The body has to match one of them.
   *
   * @see {@link titleRegexes}
   */
  bodyRegexes: string[];

  /** A list of blacklisted domains. */
  domainBlacklist: string[] | null;
  /** If not `null` only link submissions with a domain from the list can be submitted. */
  domainWhitelist: string[] | null;
}
