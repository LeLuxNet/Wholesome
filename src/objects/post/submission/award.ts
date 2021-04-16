import { Image } from "../../../media/image";

export class Award {
  id: string;
  name: string;
  description: string;

  coinPrice: number;
  coinReward: number;
  daysPremium: number;

  startDate: Date | null;
  endDate: Date | null;

  icon: Image;

  private _tierIcons?: Image[];

  constructor(data: Api.Award) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;

    this.coinPrice = data.coin_price;
    this.coinReward = data.coin_reward;
    this.daysPremium = data.days_of_premium;

    this.startDate =
      data.start_date === null ? null : new Date(data.start_date * 1000);
    this.endDate =
      data.end_date === null ? null : new Date(data.end_date * 1000);

    this.icon = {
      native: {
        url: data.icon_url,
        width: data.icon_width,
        height: data.icon_height,
      },
      resized: data.resized_icons.map((i) => {
        return {
          url: i.url,
          width: i.width,
          height: i.height,
        };
      }),
    };

    if (data.tiers_by_required_awardings !== null) {
      Object.defineProperty(this, "_tierIcons", {
        value: [],
      });

      Object.entries(data.tiers_by_required_awardings).forEach(
        ([key, i]) =>
          (this._tierIcons![parseInt(key)] = {
            native: {
              url: i.icon.url,
              width: i.icon.width,
              height: i.icon.height,
            },
            resized: i.resized_icons.map((i) => {
              return {
                url: i.url,
                width: i.width,
                height: i.height,
              };
            }),
          })
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

  constructor(data: Api.Award) {
    super(data);
    this.count = data.count;
  }
}
