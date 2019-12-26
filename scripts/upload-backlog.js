// @ts-check

// This script aims to 


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

const allMetadata = {
  // Nightly: { monaco: "next", module: "@typescript-deploys/monaco-editor" },
  // "3.7.3": { monaco: "0.19.0", module: "@typescript-deploys/monaco-editor" },
  "3.6.3": { monaco: "0.18.1", module: "monaco-editor" },
  "3.5.1": { monaco: "0.17.1", module: "monaco-editor" },
  "3.3.3": { monaco: "0.16.1", module: "monaco-editor" },
  "3.1.6": { monaco: "0.15.6", module: "monaco-editor" },
  "3.0.1": { monaco: "0.14.3", module: "monaco-editor" },
  "2.8.1": { monaco: "0.13.1", module: "monaco-editor" },
  "2.7.2": { monaco: "0.11.1", module: "monaco-editor" },
  "2.4.1": { monaco: "0.10.0", module: "monaco-editor" }
};

const execME = cmd => exec(cmd, { cwd: "monaco-editor" });

function main() {
  console.log("## Creating build of Monaco Editor");
  process.stdout.write("> node publish-monaco-editor.js");

  Object.keys(allMetadata).forEach(version => {
    const md = allMetadata[version]

    exec("rm -rf releases")
    exec("git clone https://github.com/microsoft/monaco-editor.git")

    execME("git stash")
    execME("git checkout v" + md.monaco)
    execME("npm i")
    execME("gulp release")

    exec("node ./upload-assets-to-blob-storage.js")
  })

  step("Done!");
}

main();
