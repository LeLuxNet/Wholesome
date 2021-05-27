import axios from "axios";
import { createReadStream } from "fs";
import { readFile } from "fs/promises";
import { ar } from "../test/setup";
import { upload } from "./upload";

(ar ? it : it.skip)("should upload the image", async () => {
  const localFile = "src/test/image.png";

  const url = await upload(await ar!, createReadStream(localFile), "image/png");

  const uploadedFile = await axios.get(url);

  expect(await readFile(localFile, "utf8")).toBe(uploadedFile.data);
});
