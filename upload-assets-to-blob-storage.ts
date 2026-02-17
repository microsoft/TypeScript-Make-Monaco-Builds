// @ts-check

const { readFileSync, writeFileSync } = require("fs");
const exec = require("./exec");

const optionalTag = process.argv.slice(2)[0];




const step = msg => console.log("\n\n - " + msg);

function main() {
  console.log("## Uploading build of Monaco Editor");
  process.stdout.write("> node upload-assets-to-blob-storage.ts");

  const typescriptPackageJSON = JSON.parse(readFileSync("monaco-editor/package.json", "utf8"));
  const safeTypeScriptPackage = typescriptPackageJSON.version;

  // Upload the full monaco-editor
  step("Uploading Monaco");
  exec("rm -rf releases");
  exec("mkdir releases");
  exec(`mkdir releases/${safeTypeScriptPackage}`);
  exec(`cp -r monaco-editor/out/monaco-editor releases/${safeTypeScriptPackage}/monaco/`);

  // This is basically for nightlies, but if a 2nd arg is passed then we include a duped copy of the 
  // monaco-editor and monaco-typescript with the tag which was passed as an arg to the script
  if (optionalTag) {
    exec(`mkdir releases/${optionalTag}`);
    exec(`cp -r monaco-editor/out/monaco-editor releases/${optionalTag}/monaco/`);
  }

  step("Uploading TypeScript");
  exec(`cp -r monaco-editor/node_modules/typescript releases/${safeTypeScriptPackage}/typescript`);
  if (optionalTag) {
    exec(`cp -r monaco-editor/node_modules/typescript releases/${optionalTag}/typescript`);
  }

  exec(`az storage blob upload-batch --auth-mode login --source releases/ --destination '$web' --destination-path cdn/ --overwrite`);

  step("Updating an index");
  //  Make sure we have some kind of index
  const isPreRelease = safeTypeScriptPackage.includes("-");
  const filename = isPreRelease ? "pre-releases.json" : "releases.json";

  exec(`az storage blob download --auth-mode login --container-name '$web' --name indexes/${filename} --file ${filename}`);
  exec(`json -I -f ${filename} -e "this.versions = Array.from(new Set([...this.versions, '${safeTypeScriptPackage}'])).sort()"`);
  exec.continueOnError(`az storage blob upload --auth-mode login --file ${filename} --container-name '$web' --name indexes/${filename} --overwrite`);

  // Update the next.json to be the latest _known_ nightly build of TS
  if (isPreRelease) {
    const existingReleases = JSON.parse(readFileSync(filename, "utf8")).versions;
    const devReleases = existingReleases.filter(f => f.includes("-dev"));
    const latest = devReleases.pop();
    writeFileSync("releases/next.json", JSON.stringify({ version: latest }));
    exec.continueOnError(`az storage blob upload --auth-mode login --file "releases/next.json" --container-name '$web' --name "indexes/next.json" --overwrite`);
  }


  step("Done!");
  if (exec.hasError()) {
    process.exit(1);
  }
}

main();
