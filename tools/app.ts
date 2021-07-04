import axios from "axios";
import { mkdir, rm, writeFile } from "fs/promises";
import java from "java";
import { join } from "path";

const maven = [
  "com.github.lanchon.dexpatcher.multidexlib2/2.3.4",

  "org.smali.dexlib2/2.5.2",

  "com.google.code.findbugs.jsr305/3.0.2",
  "com.google.guava.guava/27.1-android",

  "com.google.errorprone.error_prone_annotations/2.2.0",
  "com.google.guava.failureaccess/1.0.1",
  "com.google.guava.listenablefuture/9999.0-empty-to-avoid-conflict-with-guava",
  "com.google.j2objc.j2objc-annotations/1.1",
  "org.checkerframework.checker-compat-qual/2.5.2",
  "org.codehaus.mojo.animal-sniffer-annotations/1.17",
];

java.asyncOptions = {
  syncSuffix: "",
};

const fileRegex = /^.+(Query|Mutation)\.kt$/;

async function run() {
  const _tmp = join(__dirname, "tmp");
  await rm(_tmp, { recursive: true, force: true });
  await mkdir(_tmp, { recursive: true });

  const tmp = (str: string) => join(_tmp, str);

  const graphql = join(__dirname, "graphql");
  await rm(graphql, { recursive: true, force: true });
  await mkdir(graphql, { recursive: true });

  for (const m of maven) {
    const [path, version] = m.split("/");

    const res = await axios.get(
      `https://repo1.maven.org/maven2/${path.replace(
        /\./g,
        "/"
      )}/${version}/${path.split(".").pop()}-${version}.jar`,
      { responseType: "arraybuffer" }
    );

    const jarPath = tmp(`${path}.jar`);

    await writeFile(jarPath, res.data);
    java.classpath.push(jarPath);
  }

  const File = java.import("java.io.File");

  const MultiDex = java.import("lanchon.multidexlib2.MultiDexIO");
  const BasicDexFileNamer = java.import(
    "lanchon.multidexlib2.BasicDexFileNamer"
  );

  const apk = new File(join(__dirname, "reddit.apk"));
  const dex = MultiDex.readDexFile(
    true,
    apk,
    new BasicDexFileNamer(),
    null,
    null
  );

  const classes: any[] = dex.getClasses().toArray();

  for (const c of classes) {
    const file: string | null = c.getSourceFile();
    if (file === null || !file.match(fileRegex)) {
      continue;
    }

    let query: string | undefined;
    let id: string | undefined;

    const dMethods = c.getDirectMethods().iterator();
    while (dMethods.hasNext()) {
      const method = dMethods.next();

      if (method.getName() === "<clinit>") {
        const instructions = method
          .getImplementation()
          .getInstructions()
          .iterator();

        while (instructions.hasNext()) {
          const instruction = instructions.next();

          if (instruction.opcode.name === "const-string") {
            if (instruction.getRegisterA() === 0) {
              query = instruction.getReference().getString();
            }
            break;
          }
        }
        break;
      }
    }

    const vMethods = c.getVirtualMethods().iterator();
    while (vMethods.hasNext()) {
      const method = vMethods.next();

      if (
        method.getName() === "c" &&
        method.getReturnType() === "Ljava/lang/String;"
      ) {
        const instructions = method
          .getImplementation()
          .getInstructions()
          .iterator();

        id = instructions.next().getReference().getString();
        break;
      }
    }

    if (query) {
      await writeFile(
        join(graphql, file.replace(".kt", ".graphql")),
        `# ${id}\n${query}`
      );
    }
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
