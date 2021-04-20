/// <reference path="../../index.d.ts" />
declare namespace Api {
  export type Widget = IdCardWidget | ModWidget | MenuWidget | SidebarWidget;

  export type SidebarWidget =
    | SubredditRulesWidget
    | TextareaWidget
    | ButtonWidget
    | ImageWidget
    | CommunityListWidget
    | CalendarWidget
    | PostFlairWidget
    | CustomWidget;

  interface BaseWidget {
    styles: {
      headerColor: "" | null;
      backgroundColor: "" | null;
    };
    id: string;
  }

  interface IdCardWidget extends BaseWidget {
    kind: "id-card";
    description: "" | string;
    subscribersText: "" | string;
    currentlyViewingCount: number;
    subscribersCount: number;
    currentlyViewingText: "" | string;
  }

  interface ModWidget extends BaseWidget {
    kind: "moderators";
    mods: {
      name: string;
      authorFlairType: "text";
      authorFlairTextColor: "dark";
      authorFlairBackgroundColor: "" | string;
      authorFlairRichText: Flair[];
      authorFlairText: string | null;
    }[];
    totalMods: number;
  }

  interface MenuWidget extends BaseWidget {
    kind: "menu";
    data: MenuItem[];
    showWiki: boolean;
  }
  type MenuItem =
    | { text: string; url: string }
    | { text: string; children: MenuItem[] };

  interface SubredditRulesWidget extends BaseWidget {
    kind: "subreddit-rules";
    display: "compact" | "full";
    data: Rule[];
  }

  interface TextareaWidget extends BaseWidget {
    kind: "textarea";
    shortName: string;
    textHtml: string;
    text: string;
  }

  interface ButtonWidget extends BaseWidget {
    kind: "button";
    shortName: string;
    description: "" | string;
    buttons: Button[];
    descriptionHtml: string | null;
  }
  type Button = TextButton | ImageButton;
  interface TextButton {
    kind: "text";
    url: string;
    text: string;
    color: string;
  }
  interface ImageButton {
    kind: "image";
    url: string;
    text: string;
    height: number;
    width: number;
    linkUrl: string;
  }

  interface ImageWidget extends BaseWidget {
    kind: "image";
    shortName: string;
    data: WidgetImage[];
  }
  export interface WidgetImage extends Image {
    linkUrl: string;
  }

  interface CommunityListWidget extends BaseWidget {
    kind: "community-list";
    shortName: string;
    description: string;
    data: Community[];
  }
  interface Community {
    iconUrl: "" | string;
    name: string;
    subscribers: number;
    primaryColor: "" | string;
    isSubscribed: boolean;
    type: "subreddit";
    communityIcon: "" | string;
    isNSFW: boolean;
  }

  interface CalendarWidget extends BaseWidget {
    kind: "calendar";
    shortName: string;
    googleCalendarId: string;
    requiresSync: boolean;
    configuration: {
      showDescription: boolean;
      numEvents: number;
      showTime: boolean;
      showLocation: boolean;
      showTitle: boolean;
      showDate: boolean;
    };
    data: [];
  }

  interface PostFlairWidget extends BaseWidget {
    templates: {
      [id: string]: {
        text: string;
        richtext: Flair[];
        backgroundColor: string;
        templateId: string;
        textColor: "light";
        type: "richtext";
      };
    };
    kind: "post-flair";
    shortName: string;
    display: "list";
    order: [];
  }

  interface CustomWidget extends BaseWidget {
    kind: "custom";
    shortName: string;
    // TODO: Add images
    imageData: unknown[];
    text: string;
    stylesheetUrl: string;
    height: number;
    textHtml: string;
    css: string;
  }
}
