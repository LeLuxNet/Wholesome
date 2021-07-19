/// <reference path="../../index.d.ts" />
declare namespace Api {
  export interface GFollowers {
    identity: {
      followedByRedditorsInfo: GListing<GFollowerNode>;
    };
  }

  export type GFollowerNode = GUserNode | GUserUnavailableNode;

  export interface GUserNode {
    __typename: "Redditor";
    id: string;
    name: string;

    icon_24: BaseImage;
    icon_32: BaseImage;
    icon_48: BaseImage;
    icon_64: BaseImage;
    icon_72: BaseImage;
    icon_96: BaseImage;
    icon_128: BaseImage;
    icon_144: BaseImage;
    icon_192: BaseImage;
    icon_288: BaseImage;
    icon_384: BaseImage;

    snoovatarIcon: BaseImage;

    profile: {
      isNsfw: boolean;
    };

    displayName: string;
    isFollowed: boolean;
    karma: {
      total: number;
    };
  }

  export interface GUserUnavailableNode {
    __typename: "UnavailableRedditor";
  }
}
