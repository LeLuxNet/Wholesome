import {
  ButtonWidget,
  CalendarWidget,
  CustomWidget,
  FlairWidget,
  ImageWidget,
  RulesWidget,
  SubredditsWidget,
  TextWidget,
  Widgets,
} from "../..";
import { ar } from "../../test/setup";

(ar ? describe : describe.skip)("widget", () => {
  let w: Widgets;
  beforeAll(async () => {
    const r = await ar!;
    w = await r.subreddit("wholesome_testing").widgets();
  });

  it("should have menu widgets", async () => {
    expect(w.menu?.items.length).toBe(2);
    expect(w.menu?.items[0].text).toBe("Tab 1");
    expect(w.menu?.items[0].children).toBeUndefined();
    expect(w.menu?.items[1].text).toBe("Tab 2");
    expect(w.menu?.items[1].children!.length).toBe(2);
    expect(w.menu?.items[1].children![0].text).toBe("Subtab 1");
    expect(w.menu?.items[1].children![1].text).toBe("Subtab 2");
  });

  it("should have ID card widget", async () => {
    expect(w.id.memberText).toBe("Members text");
    expect(w.id.activeMemberText).toBe("Online text");
  });

  it("should have moderator widget", async () => {
    expect(w.moderator.modCount).toBe(w.moderator.mods.length);
    expect(w.moderator.modCount).toBe(1);
  });

  it("should be rules widget", async () => {
    const d = w.sidebar[0] as RulesWidget;

    expect(d.rules.length).toBe(3);
  });

  it("should be text widget", async () => {
    const d = w.sidebar[1] as TextWidget;

    expect(d.title).toBe("Textarea widget");
    expect(d.text.markdown).toBe("Text");
  });

  it("should be button widget", async () => {
    const d = w.sidebar[2] as ButtonWidget;

    expect(d.title).toBe("Button widget");
    expect(d.description?.markdown).toBe("Button");

    expect(d.buttons[0].text).toBe("Button 1");
    expect(d.buttons[0].url).toBe("https://example.com");
    expect(d.buttons[0].image).toBeNull();

    expect(d.buttons[1].text).toBe("Button 2");
    expect(d.buttons[1].url).toBe("https://example.com");
    await expect(d.buttons[1].image).rightSize();
  });

  it("should be image widget", async () => {
    const d = w.sidebar[3] as ImageWidget;

    expect(d.title).toBe("Image widget");
  });

  it("should be subreddit list widget", async () => {
    const d = w.sidebar[4] as SubredditsWidget;

    expect(d.title).toBe("Community list widget");
  });

  it("should be calendar widget", async () => {
    const d = w.sidebar[5] as CalendarWidget;

    expect(d.title).toBe("Calendar widget");
  });

  it("should be flair widget", async () => {
    const d = w.sidebar[6] as FlairWidget;

    expect(d.title).toBe("Post flair widget");
  });

  it("should be custom widget", async () => {
    const d = w.sidebar[7] as CustomWidget;

    expect(d.title).toBe("Custom widget");
    expect(d.height).toBe(100);
    expect(d.text.markdown).toBe("Text");
    expect(d.stylesheet).toBe(".some-class {}");
  });
});
