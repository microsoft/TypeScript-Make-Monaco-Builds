import * as github from "@actions/github";

if (!process.env.GITHUB_TOKEN) {
  throw new Error("No GITHUB_TOKEN specified");
}

if (!process.env.BOT_GITHUB_TOKEN) {
  throw new Error("No BOT_GITHUB_TOKEN specified");
}

if (!process.argv[2]) {
  throw new Error("No Pull Request number specified");
}

if (!process.argv[3]) {
  throw new Error("No npm tag specified");
}

const prNumber = process.argv[2];
const npmTag = process.argv[3];

const octokit = github.getOctokit(process.env.BOT_GITHUB_TOKEN);

// Prints a semver version for the PR sandbox

try {
  // Download all comments
  const results = await octokit.paginate(octokit.rest.issues.listComments, {
    owner: "microsoft",
    repo: "TypeScript",
    issue_number: Number(prNumber)
  });

  // Get comments by the TS bot and sort them so the most recent is first
  const messagesByTheBot = results.filter(issue => issue.user?.id === 23042052).reverse();
  const messageWithTGZ = messagesByTheBot.find(m => m.body?.includes("an installable tgz") && m.body?.includes("packed"));

  // If we find it and it's not sneakily been edited already
  if (messageWithTGZ?.body && !messageWithTGZ.body.includes("playground")) {
    console.error(`Updating comment ${messageWithTGZ.id} on microsoft/TypeScript#${prNumber}`);
    const npmURL = `[npm](https://www.npmjs.com/package/@typescript-deploys/pr-build/v/${npmTag})`
    const newBody = `${messageWithTGZ.body}\n\n---\n\nThere is also a playground [for this build](https://www.typescriptlang.org/play?ts=${npmTag}) and an ${npmURL} module you can use via \`"typescript": "npm:@typescript-deploys/pr-build@${npmTag}"\`.;`

    await octokit.rest.issues.updateComment({
      comment_id: messageWithTGZ.id,
      body: newBody,
      owner: "microsoft",
      repo: "TypeScript"
    });
  }
} catch (failed) {
  process.exitCode = 1;
  console.log("Failed to get PR comments:", failed);
}
