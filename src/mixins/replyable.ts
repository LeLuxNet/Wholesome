import Identified from "../interfaces/identified";

export default function Replyable<T extends new (...args: any[]) => Identified>(
  base: T
) {
  abstract class Mixin extends base {
    async reply(body: string) {
      this.r.needScopes();
      await this.r.api.post("api/comment", {
        thing_id: this.fullId,
        text: body,
      });
    }
  }
  return Mixin;
}
