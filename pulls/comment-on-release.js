// @ts-check

if (!process.env.GITHUB_TOKEN) {
  throw new Error("No GITHUB_TOKEN specified");
}

if (!process.argv[2]) {
  throw new Error("No Pull Request number specified");
}

if (!process.argv[3]) {
  throw new Error("No npm tag specified");
}

const prNumber = process.argv[2];
const npmTag = process.argv[3];

const github = require("@actions/github");
const octokit = new github.GitHub(process.env.GITHUB_TOKEN);

console.error(`Commenting on microsoft/TypeScript#${prNumber}`);
const body = `Created a playground [for this build](https://www.typescriptlang.org/play/index.html?ts=${npmTag}).`

octokit.issues.createComment({
  body,
  issue_number: Number(prNumber),
  owner: "microsoft",
  "repo": "TypeScript"
})
