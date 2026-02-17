import * as github from "@actions/github";

if (!process.env.GITHUB_TOKEN) {
  throw new Error("No GITHUB_TOKEN specified");
}

if (!process.argv[2]) {
  throw new Error("No Pull Request number specified");
}

const prNumber = process.argv[2];
const octokit = github.getOctokit(process.env.GITHUB_TOKEN);

console.error(`Getting microsoft/TypeScript#${prNumber}`);

// Download all comments
octokit.paginate(octokit.rest.issues.listComments, {
  owner: "microsoft",
  repo: "TypeScript",
  issue_number: Number(prNumber)
}).then(
  results => {
    // Get comments by the TS bot and sort them so the most recent is first
    const messagesByTheBot = results
      .filter(issue => issue.user?.id === 23042052)
      .map(issue => issue.body)
      .filter((body): body is string => body != null)
      .reverse();

    const messageWithTGZ = messagesByTheBot.find(m => m.includes("an installable tgz") && m.includes("packed"))
    
    // https://regex101.com/r/gG40L4/1
    const regexForMessage = new RegExp('"typescript": "(.*)"')
    
    if (messageWithTGZ) {
      const results = messageWithTGZ.match(regexForMessage)
      if (results) {
        console.log(results[1])
      } else {
        process.exitCode = 1
        console.log("Could not find a message to build a deploy from")
      }
    } else {
      process.exitCode = 1
      console.log("Could not find a message to build a deploy from")
    }
  },
  (failed: any) => {
    process.exitCode = 1
    console.log("Failed to get PR comments:", failed);
  }
);
