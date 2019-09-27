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
  const typescriptTag = args[0] ? args[0] : "next"
  const tagPrefix = args[0] ? "" : "--tag nightly"

  console.log(chalk.bold("## Creating build of Monaco TypeScript"));
  process.stdout.write(chalk.grey("> node publish-monaco-ts.js"));

  // Create a tarball of the current version
  step("Cloning the repo");
  exec("git clone https://github.com/microsoft/monaco-typescript.git");

  const execMTS = (cmd) => exec(cmd, { cwd: "monaco-typescript" })
  step("Installing NPM");
  execMTS("npm i")

  step("Overwriting the version of TypeScript in Monaco TypeScript");
  execMTS(`npm install --save "typescript@${typescriptTag}"`)

  step("npm run import-typescript");
  execMTS(`npm install --save "typescript@${version}"`)

  const version = args[1] 
  if (version) {
    step(`Setting the version to ${version}`);
  } else {
    step("Grabbing the version from the TypeScript build");
    execMTS("json -f node_modules/typescript/package.json version")
  }
  
  step("Setting the name");
  execMTS(`json -I -f package.json -e "this.name='@typescript-deploys/monaco-typescript'"`)

  step("Setting the name");
  execMTS(`npm publish --access public ${tagPrefix}`)
}

main()
