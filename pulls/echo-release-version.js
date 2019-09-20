// @ts-check

// Prints a semver version for the PR sandbox

if (!process.env.GITHUB_TOKEN) {
  throw new Error("No GITHUB_TOKEN specified");
}

if (!process.argv[2]) {
  throw new Error("No Pull Request number specified");
}

const prNumber = process.argv[2];
const github = require("@actions/github");
const octokit = new github.GitHub(process.env.GITHUB_TOKEN);

console.error(`Getting microsoft/TypeScript#${prNumber}`);
const options = octokit.issues.listComments.endpoint.merge({
  owner: "microsoft",
  repo: "TypeScript",
  issue_number: prNumber
});

// Download all comments
octokit.paginate(options).then(
  results => {
    // Get comments by the TS bot and sort them so the most recent is first
    const messagesByTheBot = results
      .filter(issue => issue.user.id === 23042052)
      .reverse();

    const messageWithTGZ = messagesByTheBot.find(m => m.body.includes("an installable tgz") && m.body.includes("packed"))

    // https://regex101.com/r/gG40L4/2
    const regexForVersionInSideMessage = new RegExp('typescript-([0-9]*.[0-9]*.[0-9]*)-')
    const regexResults = messageWithTGZ.body.match(regexForVersionInSideMessage)
    const version = regexResults[1]
    const index = results.indexOf(messageWithTGZ)

    console.log(`${version}-pr-${prNumber}-${index}`)
  },
  failed => {
    process.exitCode = 1
    console.log("Failed to get PR comments:", failed);
  }
);
