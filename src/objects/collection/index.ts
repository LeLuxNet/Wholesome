import Deletable from "../../interfaces/deletable";
import Reddit from "../../reddit";
import { Submission } from "../post";
import { Subreddit } from "../subreddit";
import { User } from "../user";

export class Collection implements Deletable {
  r: Reddit;
  id: string;

  title: string;
  description: string;

  url: string;

  submissions: Submission[];

  created: Date;
  updated: Date;

  author: User;
  subreddit: Subreddit;

  /** @internal */
  constructor(r: Reddit, data: Api.SubmissionCollection) {
    this.r = r;
    this.id = data.collection_id;

    this.title = data.title;
    this.description = data.description;

    const urlParts = data.permalink.split("/");
    this.url = `${r.linkUrl}/${urlParts.slice(3).join("/")}`;

    this.submissions = data.link_ids.map((s) => r.submission(s));

    this.created = new Date(data.created_at_utc * 1000);
    this.updated = new Date(data.last_update_utc * 1000);

    this.author = r.user(data.author_name);
    this.subreddit = r.subreddit(urlParts[4]);
  }

  async updateTitle(title: string) {
    this.r.needScopes("modposts");
    await this.r.api.post("api/v1/collections/update_collection_title", {
      collection_id: this.id,
      title,
    });
  }

  async updateDescription(description: string) {
    this.r.needScopes("modposts");
    await this.r.api.post("api/v1/collections/update_collection_description", {
      collection_id: this.id,
      description,
    });
  }

  async addSubmission(submission: Submission) {
    await this.r.api.post("api/v1/collections/add_post_to_collection", {
      collection_id: this.id,
      link_fullname: submission.fullId,
    });
  }

  async removeSubmission(submission: Submission) {
    await this.r.api.post("api/v1/collections/remove_post_in_collection", {
      collection_id: this.id,
      link_fullname: submission.fullId,
    });
  }

  async delete() {
    this.r.needScopes("modposts");
    await this.r.api.post("api/v1/collections/delete_collection", {
      collection_id: this.id,
    });
  }

  async follow(follow: boolean) {
    this.r.needScopes("subscribe");
    await this.r.api.post("api/v1/collections/follow_collection", {
      collection_id: this.id,
      follow,
    });
  }
}
