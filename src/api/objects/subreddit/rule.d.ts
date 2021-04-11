/// <reference path="../../index.d.ts" />
declare namespace Api {
  export interface Rule {
    kind: "link" | "comment" | "all";
    description: "" | string;
    short_name: string;
    violation_reason: string;
    created_utc: number;
    priority: number;
    description_html?: string;
  }

  export interface Reason {
    usernamesInputTitle?: string;
    complaintButtonText?: string;
    complaintUrl?: string;
    complaintPageTitle?: string;
    nextStepHeader?: string;
    reasonTextToShow: string;
    canSpecifyUsernames?: boolean;
    canWriteNotes?: boolean;
    isAbuseOfReportButton?: boolean;
    notesInputTitle?: string;
    nextStepReasons?: Reason[];
    reasonText: "" | string;
    fileComplaint?: boolean;
    complaintPrompt?: string;
    requestCrisisSupport?: boolean;
    oneUsername?: boolean;
  }
}
