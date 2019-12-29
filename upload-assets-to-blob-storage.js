const { readFileSync } = require("fs");

// @ts-check

const { execSync } = require("child_process");

const exec = (cmd, opts) => {
  console.log(`> ${cmd} ${opts ? JSON.stringify(opts) : ""}`);
  try {
    return execSync(cmd, opts);
  } catch (error) {
    console.error(error.message);
  }
};

const step = msg => console.log("\n\n - " + msg);

function main() {
  console.log("## Creating build of Monaco Editor");
  process.stdout.write("> node publish-monaco-editor.js");

  const typescriptPackageJSON = JSON.parse(readFileSync("monaco-editor/node_modules/typescript/package.json", "utf8"))
  const safeTypeScriptPackage = typescriptPackageJSON.version;

  //  Make sure we have some kind of index

  // Upload the full monaco-editor
  step("Uploading Monaco");
  exec("rm -rf releases")
  exec("mkdir releases")
  exec(`mkdir releases/${safeTypeScriptPackage}`)
  exec(`cp -r monaco-editor/release releases/${safeTypeScriptPackage}/monaco/`)

  step("Uploading TypeScript");
  exec(`cp -r monaco-editor/node_modules/typescript releases/${safeTypeScriptPackage}/typescript`)
  exec(`az storage blob upload-batch -s releases/ -d cdn`)

  step("Updating an index");
  exec(`az storage blob download -c indexes -n indexes.json -f indexes.json`)
  exec(`json -I -f indexes.json -e "this.versions = Array.from(new Set([...this.versions, '${safeTypeScriptPackage}'])).sort()"`)
  exec(`az storage blob upload  -f indexes.json -c indexes -n indexes.json`)

  step("Done!");
}

main();
