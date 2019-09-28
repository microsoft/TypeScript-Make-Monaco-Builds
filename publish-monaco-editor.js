// @ts-check

const { execSync } = require("child_process");
const args = process.argv.slice(2);

const exec = (cmd, opts) => {
  console.log(`> ${cmd} ${opts ? JSON.stringify(opts) : ""}`);
  return execSync(cmd, opts);
};

const step = (msg) => console.log("\n\n - " + msg);

function main() {
  const monacoTypescriptTag = args[0]
  const tagPrefix = args[0].includes("http") ? "" : `--tag ${monacoTypescriptTag}`

  console.log("## Creating build of Monaco Editor");
  process.stdout.write("> node publish-monaco-editor.js");

  // Create a tarball of the current version
  step("Cloning the repo");
  // exec("git clone https://github.com/microsoft/monaco-editor.git");

  const execME = (cmd) => exec(cmd, { cwd: "monaco-editor" })
  const execRelease = (cmd) => exec(cmd, { cwd: "monaco-editor/release" })
  
  const user = exec("npm whoami").toString().trim()

  step("Renaming");
  execME(`json -I -f package.json -e "this.name='@${user}/monaco-editor'"`)

  step("Overwriting the Monaco TypeScript with our new build + grabbing deps");
  execME(`yarn add --dev "monaco-typescript@npm:@${user}/monaco-typescript@${monacoTypescriptTag}"`)

  step("Matching the versions");
  const monacoTypeScriptVersion = execME("json -f node_modules/monaco-typescript/package.json version").toString().trim()
  execME(`json -I -f package.json -e "this.version='${monacoTypeScriptVersion}'"`)

  step("Creating release folder");
  execME(`gulp release`)

  // Run the final command inside the release dir
  step("Publishing");
  execRelease(`npm publish --access public ${tagPrefix}`)
}

main()
