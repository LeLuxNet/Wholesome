import browserify from "browserify";
import { exec as execCallback } from "child_process";
import { rm, writeFile } from "fs/promises";
import { compiler } from "google-closure-compiler";
import { join } from "path";
import { Stream } from "stream";
import { minify } from "uglify-js";
import Reddit, { FullSubmission } from "../src";

function exec(cmd: string) {
  return new Promise<void>((resolve, reject) =>
    execCallback(cmd, (err, stdout) => (err ? reject(stdout) : resolve()))
  );
}

function stream2string(stream: Stream) {
  const chunks: Buffer[] = [];
  return new Promise<string>((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", (err) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

async function generateAwards() {
  const r = new Reddit({ userAgent: "Wholesome Build" });

  const awards = new Map<string, FullSubmission[]>();

  const submissions = await r.submissions("msblc3", "jptqj9");
  for (const s of submissions) {
    for (const a of s.awards) {
      let aSubmissions = awards.get(a.id);
      if (!aSubmissions) {
        aSubmissions = [];
        awards.set(a.id, aSubmissions);
      }
      aSubmissions.push(s);
    }
  }

  const lines = ["export const awardMap: { [id: string]: string } = {"];

  for (const [id, submissions] of awards) {
    lines.push(
      `  "${id}": "${
        submissions.sort((a, b) => a.award.length - b.award.length)[0].id
      }",`
    );
  }

  lines.push("};\n");

  await writeFile("src/objects/award/data.ts", lines.join("\n"));
}

function size(code: string) {
  console.log(` (${Math.round(code.length / 100) / 10} kB)`);
}

async function run() {
  const dist = "dist";

  await rm(dist, { recursive: true, force: true });

  const browserPath = join(dist, "browser.js");

  console.log("Generate");
  await generateAwards();

  console.log("TypeScript");
  await exec("tsc");

  process.stdout.write("Browserify");
  let code = await stream2string(browserify(join(dist, "index.js")).bundle());
  size(code);

  process.stdout.write("Google Closure Compiler");
  await writeFile(browserPath, code);
  const gcc = new compiler({
    js: browserPath,
    compilation_level: "ADVANCED",
  });

  code = await new Promise<string>((resolve) =>
    gcc.run((_, out) => resolve(out))
  );
  size(code);

  process.stdout.write("Minify");
  code = minify(code).code;
  size(code);

  await Promise.all([
    writeFile(browserPath, code),
    writeFile(join("docs", "static", "browser.js"), code),
  ]);

  console.log();
  console.log("Finished!");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
