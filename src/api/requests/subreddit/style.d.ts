/// <reference path="../../index.d.ts" />
declare namespace Api {
  export interface Style {
    data: {
      content: unknown;
      style: StyleStyle;
      flairTemplate: { [id: string]: StyleFlair };
    };
  }

  type ImagePosition = "cover" | "centered" | "tiled";

  export interface StyleStyle {
    menuBackgroundBlur: null;
    bannerShowCommunityIcon: "hide" | "show";
    postDownvoteIconInactive: string | null;
    bannerCommunityNameFormat: "hide" | "slashtag";
    postUpvoteIconInactive: string | null;
    highlightColor: string;
    menuBackgroundOpacity: string | null;
    postUpvoteCountColor: string;
    bannerHeight: "large";
    postBackgroundColor: string;
    mobileBannerImage: string | null;
    bannerOverlayColor: string | null;
    bannerCommunityName: null;
    postDownvoteIconActive: string | null;
    postUpvoteIconActive: string | null;
    menuBackgroundColor: null;
    postBackgroundImagePosition: null;
    backgroundImage: null;
    backgroundImagePosition: ImagePosition;
    backgroundColor: string;
    submenuBackgroundStyle: "default" | null;
    bannerBackgroundImagePosition: ImagePosition | null;
    menuLinkColorInactive: string | null;
    bannerBackgroundColor: string | null;
    submenuBackgroundColor: string | null;
    sidebarWidgetHeaderColor: string | null;
    bannerPositionedImagePosition: ImagePosition | null;
    bannerBackgroundImage: string | null;
    postDownvoteCountColor: string;
    postPlaceholderImagePosition: ImagePosition | null;
    menuLinkColorHover: string;
    primaryColor: string;
    sidebarWidgetBackgroundColor: string | null;
    mobileKeyColor: string;
    menuPosition: "default" | "overlay" | null;
    postVoteIcons: "default" | "custom";
    menuLinkColorActive: string;
    bannerPositionedImage: string | null;
    secondaryBannerPositionedImage: string | null;
    menuBackgroundImage: string | null;
    postBackgroundImage: null;
    postPlaceholderImage: string | null;
    communityIcon: string;
    postTitleColor: string;
  }

  export interface StyleFlair {
    postBackgroundColor: string;
    postTitleColor?: string;
  }
}
