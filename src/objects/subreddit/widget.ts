import { Subreddit } from ".";
import Content from "../../media/content";
import { Image } from "../../media/image";
import Reddit from "../../reddit";
import { User } from "../user";
import { parseRule, Rule } from "./rule";

export type SidebarWidget =
  | RulesWidget
  | TextWidget
  | ButtonWidget
  | ImageWidget
  | CalendarWidget
  | SubredditsWidget
  | FlairWidget
  | CustomWidget;

export interface IdWidget {
  id: string;
  kind: "id";
  description: string | null;

  memberCount: number;
  memberText: string | null;
  activeMemberCount: number;
  activeMemberText: string | null;
}

export interface ModWidget {
  id: string;
  kind: "mods";
  modCount: number;
  mods: User[];
}

export interface MenuWidget {
  id: string;
  kind: "menu";
  items: MenuItem[];
  showWiki: boolean;
}
interface MenuItem {
  text: string;
  url?: string;
  children?: MenuItem[];
}

export interface RulesWidget {
  id: string;
  kind: "rules";
  compact: boolean;
  rules: Rule[];
}

export interface TextWidget {
  id: string;
  kind: "text";
  title: string;
  text: Content;
}

export interface ButtonWidget {
  id: string;
  kind: "button";
  title: string;
  description: Content | null;
  buttons: Button[];
}
interface Button {
  url: string;
  text: string;
  color: string | null;
  image: Image | null;
}

export interface ImageWidget {
  id: string;
  kind: "image";
  title: string;
  images: Image[];
}

export interface SubredditsWidget {
  id: string;
  kind: "subreddits";
  title: string;
  subreddits: Subreddit[];
}

export interface CalendarWidget {
  id: string;
  kind: "calendar";
  title: string;
}

export interface FlairWidget {
  id: string;
  kind: "flair";
  title: string;
}

export interface CustomWidget {
  id: string;
  kind: "custom";
  title: string;
  text: Content;
  height: number;
  stylesheet: string;
  stylesheetUrl: string;
}

export function parseIdWidget(r: Reddit, widget: Api.IdCardWidget): IdWidget {
  return {
    id: widget.id,
    kind: "id",
    description: widget.description || null,

    memberCount: widget.subscribersCount,
    memberText: widget.subscribersText || null,
    activeMemberCount: widget.currentlyViewingCount,
    activeMemberText: widget.currentlyViewingText || null,
  };
}

export function parseModWidget(r: Reddit, widget: Api.ModWidget): ModWidget {
  return {
    id: widget.id,
    kind: "mods",
    modCount: widget.totalMods,
    mods: widget.mods.map((u) => new User(r, u.name)),
  };
}

export function parseMenuWidget(r: Reddit, widget: Api.MenuWidget): MenuWidget {
  return {
    id: widget.id,
    kind: "menu",
    items: widget.data.map(mapMenuItem),
    showWiki: widget.showWiki,
  };
}
function mapMenuItem(item: Api.MenuItem): MenuItem {
  if ("url" in item) {
    return { text: item.text, url: item.url };
  }
  return { text: item.text, children: item.children.map(mapMenuItem) };
}

export function parseSidebarWidget(
  r: Reddit,
  widget: Api.SidebarWidget
): SidebarWidget {
  switch (widget.kind) {
    case "subreddit-rules":
      return {
        id: widget.id,
        kind: "rules",
        compact: widget.display === "compact",
        rules: widget.data.map(parseRule),
      };
    case "textarea":
      return {
        id: widget.id,
        kind: "text",
        title: widget.shortName,
        text: { markdown: widget.text, html: widget.textHtml },
      };
    case "button":
      return {
        id: widget.id,
        kind: "button",
        title: widget.shortName,
        description:
          widget.descriptionHtml === null
            ? null
            : { markdown: widget.description, html: widget.descriptionHtml },
        buttons: widget.buttons.map((b) => {
          return {
            url: "linkUrl" in b ? b.linkUrl : b.url,
            text: b.text,
            color: "color" in b ? b.color : null,
            image:
              "height" in b
                ? { native: { url: b.url, height: b.height, width: b.width } }
                : null,
          };
        }),
      };
    case "image":
      return {
        id: widget.id,
        kind: "image",
        title: widget.shortName,
        images: widget.data.map((d) => {
          return {
            url: d.linkUrl,
            native: { url: d.url, height: d.height, width: d.width },
          };
        }),
      };
    case "community-list":
      return {
        id: widget.id,
        kind: "subreddits",
        title: widget.shortName,
        subreddits: widget.data.map((s) => new Subreddit(r, s.name)),
      };
    case "calendar":
      // TODO: Add calendar
      return {
        id: widget.id,
        kind: "calendar",
        title: widget.shortName,
      };
    case "post-flair":
      // TODO: Add flair
      return {
        id: widget.id,
        kind: "flair",
        title: widget.shortName,
      };
    case "custom":
      return {
        id: widget.id,
        kind: "custom",
        title: widget.shortName,
        height: widget.height,
        text: { markdown: widget.text, html: widget.textHtml },
        stylesheet: widget.css,
        stylesheetUrl: widget.stylesheetUrl,
      };
  }
}

export interface Widgets {
  id: IdWidget;
  moderator: ModWidget;
  menu: MenuWidget | null;
  sidebar: SidebarWidget[];
}

export function parseWidgets(
  r: Reddit,
  { items, layout }: Api.SubredditWidgets
): Widgets {
  return {
    id: parseIdWidget(r, items[layout.idCardWidget] as Api.IdCardWidget),
    moderator: parseModWidget(
      r,
      items[layout.moderatorWidget] as Api.ModWidget
    ),
    menu:
      layout.topbar.order.length === 0
        ? null
        : parseMenuWidget(r, items[layout.topbar.order[0]] as Api.MenuWidget),
    sidebar: layout.sidebar.order.map((i) =>
      parseSidebarWidget(r, items[i] as Api.SidebarWidget)
    ),
  };
}
