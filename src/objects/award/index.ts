import { Image } from "../../media/image";

const tierIconsSymbol = Symbol();

export class Award {
  id: string;
  name: string;
  description: string;

  /** The amount of coins that have to be paid to give this award. */
  coinPrice: number;
  /** The amount of coins the user receiving this award gets. */
  coinReward: number;

  /**
   * The days of reddit premium the user receiving this award gets. This could
   * for example be the Gold award (7 days) or the Platinum award (31 days).
   */
  daysOfPremium: number;

  startDate: Date | null;
  endDate: Date | null;

  icon: Image;

  /** @internal */
  [tierIconsSymbol]?: Image[];

  /** @internal */
  constructor(data: Api.Award | Api.GAward) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;

    this.coinPrice = data.coin_price;
    this.coinReward = data.coin_reward;
    this.daysOfPremium = data.days_of_premium;

    this.startDate =
      data.start_date === null ? null : new Date(data.start_date * 1000);
    this.endDate =
      data.end_date === null ? null : new Date(data.end_date * 1000);

    if ("icon_url" in data) {
      this.icon = image(data.icon_url, data.icon_width, data.resized_icons);
    } else {
      const size = data.icon.url.endsWith("_512.png") ? 512 : 2048;

      this.icon = {
        native: { url: data.icon.url, width: size, height: size },
        resized: [
          { url: data.icon32.url, width: 32, height: 32 },
          { url: data.icon64.url, width: 64, height: 64 },
          { url: data.icon128.url, width: 128, height: 128 },
        ],
      };
    }

    if (
      "tiers_by_required_awardings" in data &&
      data.tiers_by_required_awardings
    ) {
      const list: Image[] = [];

      Object.entries(data.tiers_by_required_awardings).forEach(
        ([key, i]) =>
          (list[parseInt(key)] = image(
            i.icon.url,
            i.icon.width,
            i.resized_icons
          ))
      );

      let lastTier = this.icon;
      for (let i = 0; i < list.length; i++) {
        if (list[i] === undefined) {
          list[i] = lastTier;
        } else {
          lastTier = list[i];
        }
      }

      this[tierIconsSymbol] = list;
    }
  }

  /**
   * Returns the icon of a specific tier. On awards that don't have multiple
   * tiers it will just always return the {@link icon}. It only becomes useful
   * when used on things like the "This" award that change the icon based on the
   * count is has been awarded.
   *
   * @example
   *
   * ```ts
   * const award = await r.award(
   *   "award_68ba1ee3-9baf-4252-be52-b808c1e8bdc4"
   * ); // This award
   *
   * award.tierIcon(1); // https://i.redd.it/award_images/t5_22cerq/vu6om0xnb7e41_This.png
   * award.tierIcon(3); // https://i.redd.it/award_images/t5_q0gj4/h9u2ml36hqq51_ThisGold.png
   * ```
   *
   * @param tier The tier the icon should belong to.
   */
  tierIcon(tier: number): Image {
    const list = this[tierIconsSymbol];
    if (list === undefined) {
      return this.icon;
    } else if (tier >= list.length) {
      return list[list.length - 1];
    } else {
      return list[tier];
    }
  }
}

export class GivenAward extends Award {
  count: number;

  /** @internal */
  constructor(data: Api.Award) {
    super(data);
    this.count = data.count;
    this.icon = this.tierIcon(data.count);
  }
}

function image(u: string, w: number, r: Api.Image[]) {
  let size = w;
  if (u.startsWith("https://www.redditstatic.com")) {
    const parts = u.split("_");
    size = parseInt(parts[parts.length - 1].split(".")[0]);
  }

  const res: Image = {
    native: { url: u, width: size, height: size },
    resized: [],
  };

  if (u !== r[0].url) {
    r.forEach((i) => {
      if (i.width === 48) return;
      res.resized!.push({ url: i.url, width: i.width, height: i.height });
    });
  }

  return res;
}
