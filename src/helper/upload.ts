import axios from "axios";
import FormData from "form-data";
import { Stream } from "stream";
import Reddit from "../reddit";

export async function upload(
  r: Reddit,
  file: Stream,
  name: string,
  mimetype: string
) {
  r.authScope();

  const res = await r.api.post<Api.Media>("api/media/asset.json", {
    filepath: name,
    mimetype,
  });

  var key;
  const body = new FormData();
  res.data.args.fields.forEach(({ name, value }) => {
    body.append(name, value);
    if (name === "key") key = value;
  });
  body.append("file", file);

  const length = await new Promise<number>((resolve, reject) =>
    body.getLength((err, length) =>
      err === null ? resolve(length) : reject(err)
    )
  );

  const url = `https:${res.data.args.action}`;
  await axios.post(url, body, {
    headers: { ...body.getHeaders(), "Content-Length": length },
  });
  return `${url}/${key}`;
}
