import { FullSubreddit } from "../..";
import { r } from "../../test/setup";

let s: FullSubreddit;
beforeAll(async () => {
  s = await r.subreddit("dankmemes").fetch();
});

it("should have custom style", async () => {
  const st = await s.style();
  const voteButtons = [
    st.upvoteInactive,
    st.upvoteActive,
    st.downvoteInactive,
    st.downvoteActive,
  ];

  voteButtons.forEach((i) =>
    expect(
      i?.native.url.startsWith(
        "https://styles.redditmedia.com/t5_2zmfe/styles/post"
      )
    ).toBeTruthy()
  );
});
