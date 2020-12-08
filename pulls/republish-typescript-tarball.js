// @ts-check

const { execSync } = require("child_process");
const nodeFetch = require("node-fetch").default
const {createWriteStream, existsSync} = require("fs")
const args = process.argv.slice(2);

if (!process.env.GITHUB_TOKEN) {
  throw new Error("No GITHUB_TOKEN specified");
}

if (!args[0]) {
  throw new Error("No zip specified");
}

if (!args[1]) {
  throw new Error("No semver specified");
}

const exec = (cmd, opts) => {
  console.log(`> ${cmd} ${opts ? JSON.stringify(opts) : ""}`);
  return execSync(cmd, opts);
};

const step = (msg) => console.log("\n\n - " + msg);

const downloadFile = (async (url, path) => {
  const res = await nodeFetch(url);
  const fileStream = createWriteStream(path);
  await new Promise((resolve, reject) => {
      res.body.pipe(fileStream);
      res.body.on("error", reject);
      fileStream.on("finish", resolve);
    });
});

// const zip = "https://typescript.visualstudio.com/cf7ac146-d525-443c-b23c-0d58337efebc/_apis/build/builds/90574/artifacts?artifactName=tgz&fileId=B6CF677A3E6A1E64595A97B37265249A6F00DED8731339D3EF5314A6F40C6E3E02&fileName=/typescript-4.2.0-insiders.20201207.tgz"
// const semver = "4.2.0-pr-26797-42"

const zip = args[0]
const semver = args[1]

const go = async () => {
  // curl would download a JSON file, instead this DLs the tgz
  await downloadFile(zip, "typescript.tgz")
  if (!existsSync("typescript")) exec("mkdir typescript")
  exec(`tar -xvzf typescript.tgz -C typescript`)

  // ./typescript now has a package dir which is the extracted TypeScript dep.
  // We want to change some package.json metadata then re-upload to @typescript-deploys/pr-build
  step("Updating the package json");
  const user = exec("npm whoami").toString().trim()
  exec(`json -I -f typescript/package/package.json -e "this.name='@${user}/pr-build'"`)
  exec(`json -I -f typescript/package/package.json -e "this.version='${semver}'"`)
  
  // So that the normal build scripts don't run, as they've already happened
  exec(`json -I -f typescript/package/package.json -e "this.scripts.prepare=''"`)
 
  step("Publishing PR build to npm");
  exec("npm publish --access=public", { cwd: "typescript/package" })
}

go()
