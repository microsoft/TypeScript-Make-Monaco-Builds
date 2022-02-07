// @ts-check

const { execSync } = require("child_process");
const { existsSync } = require("fs");
const args = process.argv.slice(2);

const exec = (cmd, opts) => {
  console.log(`> ${cmd} ${opts ? JSON.stringify(opts) : ""}`);
  try {
    return execSync(cmd, opts);
  } catch (error) {
    console.log("Command Failed:")
    console.log("STDOUT:" + error.stdout.toString())
    console.log("STDERR:" + error.stderr.toString())
    throw error
  }
};

const failableMergeBranch = (exec, name) => {
  try {
    exec(`git merge origin/${name}`)
  } catch (e) {
    // NOOP
  }
}


// So, you can run this locally
const dontDeploy = !!process.env.SKIP_DEPLOY
const envUser = process.env.USER_ACCOUNT

// For example: 
//   USER_ACCOUNT="typescript-deploys" SKIP_DEPLOY="true" node ./publish-monaco-editor.js next

const step = msg => console.log("\n\n - " + msg);

function main() {
    // TypeScript calls nightlies next... So should we.
  const typescriptTag = args[0] ? args[0] : "next"
  const typescriptModuleName = args[1] ? args[1] : "typescript"

  const monacoTypescriptTag = args[0];
  const isPushedTag = process.env.GITHUB_EVENT_NAME === "push";
  const tagPrefix = isPushedTag || args[0].includes("http") || args[0].includes("-pr-") ? "" : `--tag ${monacoTypescriptTag}`;

  console.log("## Creating build of Monaco Editor");
  process.stdout.write("> node publish-monaco-editor.js");

  const execME = cmd => exec(cmd, { cwd: "monaco-editor" });
  const execRelease = cmd => exec(cmd, { cwd: "monaco-editor/release" });

  // Create a tarball of the current version
  step("Cloning the repo");

  if (existsSync("monaco-editor")) exec("rm -rf monaco-editor")
  exec("git clone https://github.com/microsoft/monaco-editor.git");

  step("Using older build of monaco-editor");
  execME("git checkout 9fac3918b2516fc983d771623c2cc578f1fd2658")

  const user = envUser || exec("npm whoami").toString().trim();

  step("Renaming");
  execME(`json -I -f package.json -e "this.name='@${user}/monaco-editor'"`);

  step("Removing TypeDoc because its ships its own version of TypeScript and npm complains");
  execME(`npm remove typedoc`)

  step("Overwriting the version of TypeScript");
  if (typescriptModuleName === "typescript") {
    execME(`npm install --save "typescript@${typescriptTag}" --force`)
  } else {
    execME(`npm install --save "typescript@npm:${typescriptModuleName}@${typescriptTag}" --force`)
  }

  step("Matching the versions");
  
  const typeScriptVersion = execME("json -f node_modules/typescript/package.json version").toString().trim();
  execME(`json -I -f package.json -e "this.version='${typeScriptVersion}'"`);

  step("Creating release folder");
  execME(`npm run release`);

  step("Updating TS in monaco-typescript");
  execME(`npm run import-typescript`);

  step("Re-running release");
  execME(`npm run release`);

  // Run the final command inside the release dir
  if (!dontDeploy) {
    step("Publishing");
    // execRelease(`npm publish --access public ${tagPrefix}`);
  }

  step("Done!");
}

main();
