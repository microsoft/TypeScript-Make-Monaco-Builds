// @ts-check

const { execSync } = require("child_process");
const { existsSync } = require("fs");
const args = process.argv.slice(2);

// So you can run this locally
const dontDeploy = !!process.env.SKIP_DEPLOY

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

const step = (msg) => console.log("\n\n - " + msg);

const failableMergeBranch = (exec, name) => {
  try {
    exec(`git merge origin/${name}`)
  } catch (e) {
    // NOOP
  }
}

const failableMergePR = (exec, number) => {
  try {
    exec(`git pull origin pull/${number}/head/`)
  } catch (e) {
    // NOOP
  }
}

function main() {

  // TypeScript calls nightlies next... So should we.
  const typescriptTag = args[0] ? args[0] : "next"
  const isPushedTag = process.env.GITHUB_EVENT_NAME === "push"
  const tagPrefix = isPushedTag || args[0].includes("http") ? "" : `--tag ${typescriptTag}`

  console.log("## Creating build of Monaco TypeScript");
  process.stdout.write("> node publish-monaco-ts.js");

  if (existsSync("monaco-typescript")) exec("rm -rf monaco-typescript")

  // Create a tarball of the current version
  step("Cloning the repo");
  exec("git clone https://github.com/microsoft/monaco-typescript.git");

  const execMTS = (cmd) => exec(cmd, { cwd: "monaco-typescript" })

  const setEmail = execMTS(`git config --global user.email`).includes("@")
  if (!setEmail) {
    execMTS(`git config --global user.email "you@example.com"`)
    execMTS(`git config --global user.name "Your Name"`)
  }

  failableMergeBranch(execMTS, "4_3_dev") // 4.3 extra args in getCompletionEntryDetails
  // failableMergePR(execMTS, 75) 

  step("Installing NPM");
  execMTS("npm i")

  execMTS("git fetch")

  // Grab the username from NPM
  const user = execMTS("npm whoami").toString().trim()

  step("Overwriting the version of TypeScript in Monaco TypeScript");
  execMTS(`npm install --save "typescript@${typescriptTag}"`)

  step("Updating the internal version of TS inside monaco");
  execMTS("npm run import-typescript");

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

  step("Running 'prePublishOnly' ahead of time for better error logs");
  execMTS(`npm run prepublishOnly`);

  if (!dontDeploy) {
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
}

main()
