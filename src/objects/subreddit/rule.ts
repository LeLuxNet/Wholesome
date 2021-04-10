import Content from "../../media/content";

export interface Rule {
  kind: "submission" | "comment" | "all";
  name: string;
  violationReason: string;
  description: Content | null;
}

export function parseRule(data: Api.Rule): Rule {
  return {
    kind: data.kind === "link" ? "submission" : data.kind,
    name: data.short_name,
    violationReason: data.violation_reason,
    description:
      data.description_html === undefined
        ? null
        : {
            markdown: data.description,
            html: data.description_html,
          },
  };
}
