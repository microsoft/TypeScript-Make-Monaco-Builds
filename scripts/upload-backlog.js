// @ts-check

// This script grabs the versions of monaco and TS from NPM and re-uploads
// them to the CDN to set it up for the existing playground supported TS versions

const fetch = require("node-fetch").default;
const { execSync } = require("child_process");
const path = require("path");

const exec = (cmd, opts) => {
  console.log(`> ${cmd} ${opts ? JSON.stringify(opts) : ""}`);
  try {
    return execSync(cmd, opts);
  } catch (error) {
    console.error(error.message);
  }
};

const step = msg => console.log("\n\n - " + msg);

const allMetadata = {
  // Nightly: { monaco: "next", module: "@typescript-deploys/monaco-editor" },
  "3.7.3": { monaco: "0.19.0" },
  "3.6.3": { monaco: "0.18.1" },
  "3.5.1": { monaco: "0.17.1" },
  "3.3.3": { monaco: "0.16.1" },
  "3.1.6": { monaco: "0.15.6" },
  "3.0.1": { monaco: "0.14.3" },
  "2.8.1": { monaco: "0.13.1" },
  "2.7.2": { monaco: "0.11.1" },
  "2.4.1": { monaco: "0.10.0" }
};

const execME = cmd => exec(cmd, { cwd: "monaco-editor" });

async function main() {
  console.log("## Uploading official builds of Monaco Editor");
  step("> node scripts/upload-backlog.js");

  const r = await fetch("https://registry.npmjs.org/monaco-editor");
  const editorJSON = await r.json();

  exec(`mkdir releases`);

  for (const tsVersion of Object.keys(allMetadata)) {
    const mVersion = allMetadata[tsVersion].monaco;

    const monacoTarURL = editorJSON.versions[mVersion].dist.tarball;
    step("Looking at monaco v" + mVersion);

    const filename = `releases/${mVersion}.tgz`;
    exec(`curl -o ${filename} ${monacoTarURL}`);

    step("Unzipping monaco");

    exec(`mkdir releases/${tsVersion}`);
    const unzippedRoot = `releases/${tsVersion}/`;
    exec(`tar -C ${unzippedRoot} -xzf  ${filename} `);
    const unzippedPath = `releases/${tsVersion}/monaco`;
    exec(`mv ${unzippedRoot}/package ${unzippedPath}`);

    step("Getting TypeScript " + tsVersion);
    const typescriptTarURL = `https://registry.npmjs.org/typescript/-/typescript-${tsVersion}.tgz`

    const tsFilename = `releases/ts-${tsVersion}.tgz`;
    exec(`curl -o ${tsFilename} ${typescriptTarURL}`);

    step("Unzipping TS");

    exec(`tar -C ${unzippedRoot} -xzf  ${tsFilename} `);
    const unzippedTSPath = `releases/${tsVersion}/typescript`;
    exec(`mv ${unzippedRoot}/package ${unzippedTSPath}`);
  }

  step("Removing downloaded tgzs")
  exec("rm releases/*.tgz")

  step("Uploading folders to CDN")
  exec(`az storage blob upload-batch -s releases/ -d cdn`)
  
  step("Done!");
}

main();
