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

  const monacoEditorPackageJSON = JSON.parse(readFileSync("monaco-editor/package.json", "utf8"))
  const safeMonacoEditorPackage = monacoEditorPackageJSON.version.replace(/\./g, '-');

  const typescriptPackageJSON = JSON.parse(readFileSync("monaco-editor/node_modules/typescript/package.json", "utf8"))
  const safeTypeScriptPackage = typescriptPackageJSON.version.replace(/\./g, '-');

  //  Make sure we have some kind of index

  // Upload the full monaco-editor
  step("Uploading Monaco");
  exec("mkdir releases")
  exec("mkdir releases/monaco")
  exec(`cp -r monaco-editor/release releases/monaco/${safeMonacoEditorPackage}`)
  exec(`az storage blob upload-batch -s releases/monaco/ -d monaco-editor`)

  step("Uploading TypeScript");
  exec("mkdir releases/ts")
  exec(`cp -r monaco-editor/node_modules/typescript releases/ts/${safeMonacoEditorPackage}`)
  exec(`az storage blob upload-batch -s releases/ts/ -d typescript`)

  step("Updating an index");
  exec(`az storage blob download -c indexes -n indexes.json -f indexes.json`)
  exec(`json -I -f indexes.json -e "this.ts = Array.from(new Set([...this.ts, '${safeTypeScriptPackage}'])).sort()"`)
  exec(`json -I -f indexes.json -e "this.monaco = Array.from(new Set([...this.monaco,'${safeMonacoEditorPackage}'])).sort()"`)
  exec(`az storage blob upload  -f indexes.json -c indexes -n indexes.json`)

  step("Done!");
}

main();
