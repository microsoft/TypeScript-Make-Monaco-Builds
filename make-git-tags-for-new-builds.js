// @ts-check

const nodeFetch = require("node-fetch").default
const { execSync } = require("child_process");

const get = async url => {
  const packageJSON = await nodeFetch(url)
  const contents = await packageJSON.json()
  return contents
}

const exec = (cmd, opts) => {
  console.log(`> ${cmd} ${opts ? JSON.stringify(opts) : ""}`);
  return execSync(cmd, opts);
};

const go = async () => {
  const localTags = exec("git tag", { encoding: "utf8" }).split("\n")

  // e.g { "latest":"4.0.3","next":"4.1.0-dev.20201026","beta":"4.1.0-beta","rc":"4.0.1-rc","insiders":"4.0.2-insiders.20200818","tag-for-publishing-older-releases":"3.6.5","dev":"3.9.4" }
  const distTags = await get("https://registry.npmjs.org/-/package/typescript/dist-tags")
  const needed = [distTags.latest, distTags.beta, distTags.rc]
  const todo = needed.filter(tag => !localTags.includes(tag))
  if (todo.length === 0) {
    console.log("No new builds to create.")
    return
  }

  console.log("Creating tags for: " + todo.join(", "))
  todo.forEach(tag => {
    exec(`git tag ${tag}`)
  })
}

go()
