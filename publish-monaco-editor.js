const { execSync } = require("child_process");
const chalk = require("chalk");
const args = process.argv.slice(2);

const exec = (cmd) => {
    console.log(chalk.gray(`> ${cmd} ${opts ? JSON.stringify(opts) : ""}`));
    return execSync(cmd, opts);
};

const step = (msg) => {
    console.log("\n\n" + chalk.bold("- ") + msg);
};

function main() {
  const monacoTypescriptTag = args[0] ? args[0] : "nightly"

  console.log(chalk.bold("## Creating build of Monaco Editor"));
  process.stdout.write(chalk.grey("> node publish-monaco-editor.js"));

  // Create a tarball of the current version
  step("Cloning the repo");
  exec("git clone https://github.com/microsoft/monaco-editor.git");

  const execME = (cmd) => exec(cmd, { cwd: "monaco-editor" })
  const execRelease = (cmd) => exec(cmd, { cwd: "monaco-editor/release" })

  step("Installing NPM");

  step("Setting the bridging");
  execME(`json -I -f package.json -e "this.name='@typescript-deploys/monaco-editor'"`)

  step("Overwriting the version of TypeScript in Monaco TypeScript");
  execME(`yarn add --dev "monaco-typescript@npm:@typescript-deploys/monaco-typescript@${monacoTypescriptTag}"`)

  step("npm run import-typescript");
  const monacoTypeScriptVersion = execME("json -f node_modules/monaco-typescript/package.json version")
  execME(`json -I -f package.json -e "this.version='${monacoTypeScriptVersion}'"`)

  step("Setting the name");
  execME(`gulp release`)

  execRelease(`npm publish --access public`)
}

main()
