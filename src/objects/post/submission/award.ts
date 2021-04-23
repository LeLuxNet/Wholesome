import { Image } from "../../../media/image";

export class Award {
  id: string;
  name: string;
  description: string;

  coinPrice: number;
  coinReward: number;

  daysOfPremium: number;

  startDate: Date | null;
  endDate: Date | null;

  icon: Image;

  private _tierIcons?: Image[];

  /** @internal */
  constructor(data: Api.Award) {
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

    this.icon = image(data.icon_url, data.icon_width, data.resized_icons);

    if (data.tiers_by_required_awardings !== null) {
      Object.defineProperty(this, "_tierIcons", {
        value: [],
      });

      Object.entries(data.tiers_by_required_awardings).forEach(
        ([key, i]) =>
          (this._tierIcons![parseInt(key)] = image(
            i.icon.url,
            i.icon.width,
            i.resized_icons
          ))
      );

      var lastTier = this.icon;
      for (let i = 0; i < this._tierIcons!.length; i++) {
        if (this._tierIcons![i] === undefined) {
          this._tierIcons![i] = lastTier;
        } else {
          lastTier = this._tierIcons![i];
        }
      }
    }
  }

  tierIcon(count: number) {
    if (this._tierIcons === undefined) {
      return this.icon;
    } else if (count >= this._tierIcons.length) {
      return this._tierIcons[this._tierIcons.length - 1];
    } else {
      return this._tierIcons[count];
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
  var size = w;
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
      if (i.width == 48) return;
      res.resized!.push({ url: i.url, width: i.width, height: i.height });
    });
  }

  return res;
}
