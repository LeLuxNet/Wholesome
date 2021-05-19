import { Subreddit } from ".";
import Deletable from "../../interfaces/deletable";
import Content from "../../media/content";
import { Image } from "../../media/image";
import { User } from "../user";
import { parseRule, Rule } from "./rule";

export interface Widgets {
  id: IdWidget;
  moderator: ModWidget;
  menu: MenuWidget | null;
  sidebar: SidebarWidget[];
}

export type SidebarWidget =
  | RulesWidget
  | TextWidget
  | ButtonWidget
  | ImageWidget
  | CalendarWidget
  | SubredditsWidget
  | FlairWidget
  | CustomWidget;

class Widget implements Deletable {
  subreddit: Subreddit;
  id: string;

  constructor(subreddit: Subreddit, id: string) {
    this.subreddit = subreddit;
    this.id = id;
  }

  async delete() {
    this.subreddit.r.needScopes("structuredstyles");
    await this.subreddit.r.api.delete("r/{sub}/api/widget/{id}", {
      fields: { sub: this.subreddit.name, id: this.id },
    });
  }
}

export class IdWidget extends Widget {
  description: string | null;

  memberCount: number;
  memberText: string | null;
  activeMemberCount: number;
  activeMemberText: string | null;

  constructor(sub: Subreddit, data: Api.IdCardWidget) {
    super(sub, data.id);
    this.description = data.description || null;

    this.memberCount = data.subscribersCount;
    this.memberText = data.subscribersText || null;
    this.activeMemberCount = data.currentlyViewingCount;
    this.activeMemberText = data.currentlyViewingText || null;
  }
}

export class ModWidget extends Widget {
  modCount: number;
  mods: User[];

  constructor(sub: Subreddit, data: Api.ModWidget) {
    super(sub, data.id);
    this.modCount = data.totalMods;
    this.mods = data.mods.map((u) => new User(sub.r, u.name));
  }
}

export class MenuWidget extends Widget {
  items: MenuItem[];
  showWiki: boolean;

  constructor(sub: Subreddit, data: Api.MenuWidget) {
    super(sub, data.id);
    this.items = data.data.map(mapMenuItem);
    this.showWiki = data.showWiki;
  }
}
interface MenuItem {
  text: string;
  url?: string;
  children?: MenuItem[];
}

function mapMenuItem(item: Api.MenuItem): MenuItem {
  if ("url" in item) {
    return { text: item.text, url: item.url };
  }
  return { text: item.text, children: item.children.map(mapMenuItem) };
}

export class RulesWidget extends Widget {
  compact: boolean;
  rules: Rule[];

  constructor(sub: Subreddit, data: Api.SubredditRulesWidget) {
    super(sub, data.id);
    this.compact = data.display === "compact";
    this.rules = data.data.map(parseRule);
  }
}

export class TextWidget extends Widget {
  title: string;
  text: Content;

  constructor(sub: Subreddit, data: Api.TextareaWidget) {
    super(sub, data.id);
    this.title = data.shortName;
    this.text = { markdown: data.text, html: data.textHtml };
  }
}

export class ButtonWidget extends Widget {
  title: string;
  description: Content | null;
  buttons: Button[];

  constructor(sub: Subreddit, data: Api.ButtonWidget) {
    super(sub, data.id);
    this.title = data.shortName;
    this.description =
      data.descriptionHtml === null
        ? null
        : { markdown: data.description, html: data.descriptionHtml };
    this.buttons = data.buttons.map((b) => ({
      url: "linkUrl" in b ? b.linkUrl : b.url,
      text: b.text,
      color: "color" in b ? b.color : null,
      image:
        "height" in b
          ? { native: { url: b.url, height: b.height, width: b.width } }
          : null,
    }));
  }
}
interface Button {
  url: string;
  text: string;
  color: string | null;
  image: Image | null;
}

export class ImageWidget extends Widget {
  title: string;
  images: Image[];

  constructor(sub: Subreddit, data: Api.ImageWidget) {
    super(sub, data.id);
    this.title = data.shortName;
    this.images = data.data.map((d) => ({
      url: d.linkUrl,
      native: { url: d.url, width: d.width, height: d.height },
    }));
  }
}

export class SubredditsWidget extends Widget {
  title: string;
  subreddits: Subreddit[];

  constructor(sub: Subreddit, data: Api.CommunityListWidget) {
    super(sub, data.id);
    this.title = data.shortName;
    this.subreddits = data.data.map((s) => new Subreddit(sub.r, s.name));
  }
}

export class CalendarWidget extends Widget {
  title: string;

  constructor(sub: Subreddit, data: Api.CalendarWidget) {
    super(sub, data.id);
    this.title = data.shortName;
    // TODO: Add calendar
  }
}

export class FlairWidget extends Widget {
  title: string;

  constructor(sub: Subreddit, data: Api.PostFlairWidget) {
    super(sub, data.id);
    this.title = data.shortName;
    // TODO: Add flair
  }
}

export class CustomWidget extends Widget {
  title: string;
  text: Content;
  height: number;
  stylesheet: string;
  stylesheetURL: string;

  constructor(sub: Subreddit, data: Api.CustomWidget) {
    super(sub, data.id);
    this.title = data.shortName;
    this.text = { markdown: data.text, html: data.textHtml };
    this.height = data.height;
    this.stylesheet = data.css;
    this.stylesheetURL = data.stylesheetUrl;
  }
}

export function parseSidebarWidget(
  sub: Subreddit,
  data: Api.SidebarWidget
): SidebarWidget {
  switch (data.kind) {
    case "subreddit-rules":
      return new RulesWidget(sub, data);
    case "textarea":
      return new TextWidget(sub, data);
    case "button":
      return new ButtonWidget(sub, data);
    case "image":
      return new ImageWidget(sub, data);
    case "community-list":
      return new SubredditsWidget(sub, data);
    case "calendar":
      return new CalendarWidget(sub, data);
    case "post-flair":
      return new FlairWidget(sub, data);
    case "custom":
      return new CustomWidget(sub, data);
  }
}

export function parseWidgets(
  sub: Subreddit,
  { items, layout }: Api.SubredditWidgets
): Widgets {
  return {
    id: new IdWidget(sub, items[layout.idCardWidget] as Api.IdCardWidget),
    moderator: new ModWidget(
      sub,
      items[layout.moderatorWidget] as Api.ModWidget
    ),
    menu:
      layout.topbar.order.length === 0
        ? null
        : new MenuWidget(sub, items[layout.topbar.order[0]] as Api.MenuWidget),
    sidebar: layout.sidebar.order.map((i) =>
      parseSidebarWidget(sub, items[i] as Api.SidebarWidget)
    ),
  };
}
