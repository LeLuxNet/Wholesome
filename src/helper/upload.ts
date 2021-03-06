import axios from "axios";
import FormData from "form-data";
import { Stream } from "stream";
import Reddit from "../reddit";

/** @internal */
export async function upload(
  r: Reddit,
  file: Stream | Buffer,
  mimetype: string
): Promise<string> {
  r.needScopes();

  const data = await r.api.p<Api.Media>("api/media/asset", {
    filepath: ".",
    mimetype,
  });

  let key;
  const body = new FormData();
  data.args.fields.forEach(({ name, value }) => {
    body.append(name, value);
    if (name === "key") key = value;
  });
  body.append("file", file);

  const url = `https:${data.args.action}`;
  await axios.post(url, body, {
    headers: body.getHeaders(),
  });
  return `${url}/${key}`;
}
