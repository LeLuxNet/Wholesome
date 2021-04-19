import { BaseImage } from "../../media/image";

export interface Style {
  upvoteInactive: BaseImage | null;
  upvoteActive: BaseImage | null;
  downvoteInactive: BaseImage | null;
  downvoteActive: BaseImage | null;
}
