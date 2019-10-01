// @ts-check

const { execSync } = require("child_process");
const args = process.argv.slice(2) || [];

const exec = (cmd, opts) => {
    console.log(`> ${cmd} ${opts ? JSON.stringify(opts) : ""}`);
    return execSync(cmd, opts);
};

const step = (msg) => console.log("\n\n - " + msg);

function main() {

  // TypeScript calls nightlies next... So should we.
  const typescriptTag = args[0] ? args[0] : "next"
  const isPushedTag = process.env.GITHUB_EVENT_NAME === "push"
  const tagPrefix = isPushedTag || args[0].includes("http") ? "" : `--tag ${typescriptTag}`

  console.log("## Creating build of Monaco TypeScript");
  process.stdout.write("> node publish-monaco-ts.js");

  // Create a tarball of the current version
  step("Cloning the repo");
  exec("git clone https://github.com/microsoft/monaco-typescript.git");

  const execMTS = (cmd) => exec(cmd, { cwd: "monaco-typescript" })
  step("Installing NPM");
  execMTS("npm i")

  // Grab the username from NPM
  const user = execMTS("npm whoami").toString().trim()

  step("Overwriting the version of TypeScript in Monaco TypeScript");
  execMTS(`npm install --save "typescript@${typescriptTag}"`)

  step("npm run import-typescript");
  
  let version = args[1] 
  if (version) {
    step(`Setting the version to ${version}`);
  } else {
    step("Grabbing the version from the TypeScript build");
    version = execMTS("json -f node_modules/typescript/package.json version").toString().trim()
  }
  execMTS(`json -I -f package.json -e "this.version='${version}'"`)
  
  step("Setting the name");
  execMTS(`json -I -f package.json -e "this.name='@${user}/monaco-typescript'"`)

  step("Publishing to NPM");
  try {
    // Support this command failing when pushing a dupe
    execMTS(`npm publish --access public ${tagPrefix}`)
  } catch (error) {
    console.log(error.message)
    
    if (!error.message.includes("previously published versions")) {
      throw error
    }
  }
}

main()
