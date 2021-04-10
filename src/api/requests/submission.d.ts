/// <reference path="../index.d.ts" />
declare namespace Api {
  export type GetSubmission = [
    Listing<SubmissionWrap>,
    Listing<CommentMoreWrap>
  ];
}
