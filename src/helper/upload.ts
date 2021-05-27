import axios from "axios";
import FormData from "form-data";
import { Stream } from "stream";
import Reddit from "../reddit";

/** @internal */
export async function upload(
  r: Reddit,
  file: Stream,
  mimetype: string
): Promise<string> {
  r.needScopes();

  const res = await r.api.post<Api.Media>("api/media/asset.json", {
    filepath: ".",
    mimetype,
  });

  let key;
  const body = new FormData();
  res.data.args.fields.forEach(({ name, value }) => {
    body.append(name, value);
    if (name === "key") key = value;
  });
  body.append("file", file);

  const url = `https:${res.data.args.action}`;
  await axios.post(url, body, {
    headers: body.getHeaders(),
  });
  return `${url}/${key}`;
}
