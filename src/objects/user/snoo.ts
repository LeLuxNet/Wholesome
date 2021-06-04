export interface OldAvatar {
  public: boolean;

  head: OldAvatarItem;

  hat: OldAvatarItem | null;
  glasses: OldAvatarItem | null;

  body: OldAvatarItem;

  top: OldAvatarItem | null;

  leftHand: OldAvatarItem | null;
  rightHand: OldAvatarItem | null;

  bottom: OldAvatarItem | null;
}

export type OldAvatarItem = { name: string } | { name: string; color: string };

export function mapOldAvatar(data: Api.Snoo): OldAvatar {
  const c = data.components;

  return {
    public: data.public,

    head: mapComponent(c["snoo-head"]),

    hat: mapComponentNull(c.hats),
    glasses: mapComponentNull(c.glasses),

    body: mapComponent(c["snoo-body"]),

    top: mapComponentNull(c.tops),

    leftHand: mapComponentNull(c.grippables),
    rightHand: mapComponentNull(c.flipped_grippables),

    bottom: mapComponentNull(c.bottoms),
  };
}

function mapComponentNull(d: Api.SnooComponent): OldAvatarItem | null {
  return d.dressingName ? mapComponent(d) : null;
}

function mapComponent(d: Api.SnooComponent): OldAvatarItem {
  return d.color
    ? { name: d.dressingName!, color: d.color }
    : { name: d.dressingName! };
}
