# Monaco Daily Builds


Uses [GitHub Actions](.github/workflows) to deploy builds of [monaco-editor](https://github.com/Microsoft/monaco-editor) using TypeScript releases, nightlies or PR builds.

These live inside typescript-deploys account on npm, credentials are in the JSTS Azure Keyvault.

See the module releases ([monaco-editor](https://www.npmjs.com/package/@typescript-deploys/monaco-editor) - click 'versions'), [GitHub releases](https://github.com/microsoft/typescript-make-monaco-builds/releases) & [daily script](.github/workflows/main.yml).

### Nightlies

The Playground will access [https://playgroundcdn.typescriptlang.org/indexes/releases/next.json](https://playgroundcdn.typescriptlang.org/indexes/releases/next.json) to see what the latest version is of Monaco for TypeScript is.

### Pull Request Builds

An external system can trigger a pull request build for any Pull Request. It can handle
multiple builds in the same PR. These are triggered via HTTP requests which have a
GitHub auth token

This workflow is triggered from an API call where XXX is your token
and YYY is the PR that it should look at.

```sh
curl https://api.github.com/repos/microsoft/typescript-make-monaco-builds/dispatches \
  -XPOST \
   -H 'Content-Type: application/json' \
   -H 'Accept: application/vnd.github.everest-preview+json' \
   -H "Authorization: token XXX" \
   --data-binary '{ "event_type": "YYY" }'
```

It will generate a PR build to NPM with the a version like: `3.7.0-33290-47` where
3.7.0 is the major version, 33290 is the PR and 47 is the index of the most recent comment
from ts-bot which includes a static build of a pull request.

### Tag Builds

When you want to trigger a build for a /specific/ build of TypeScript, you can ship a tag to this
repo with the same version which is available on the TypeScript npm module. 

Chance are that you dont need to do this because the [`nightly_check_prod_deploys.yml`](.github/workflows/nightly_check_prod_deploys.yml) will sync the tags with TypeScript every night.

### CDN'd

Every release has a corresponding upload to [azure blob storage](https://ms.portal.azure.com/#@microsoft.onmicrosoft.com/resource/subscriptions/57bfeeed-c34a-4ffd-a06b-ccff27ac91b8/resourceGroups/Playground-Static-Hosting/providers/Microsoft.Storage/storageAccounts/tswebinfra/overview) of:

- the NPM module contents of the TypeScript version (so you can grab lib files)
- the NPM module contents of monaco-typescript, so playgrounds can use custom builds of typescript

There are two indexes of all uploaded TypeScript and Monaco-Editor versions. It's important to note that Monaco Editor
is indexed by the version of TypeScript it supports - not the version of the monaco-editor package.

- Releases: [`https://playgroundcdn.typescriptlang.org/indexes/releases.json`](https://playgroundcdn.typescriptlang.org/indexes/releases.json)
- Pre-Releases: [`https://playgroundcdn.typescriptlang.org/indexes/pre-releases.json`](https://playgroundcdn.typescriptlang.org/indexes/pre-releases.json)
- Next: (provides a redirect to the latest nightly version) <br/>[`https://playgroundcdn.typescriptlang.org/indexes/next.json`](https://playgroundcdn.typescriptlang.org/indexes/next.json)

You can use the values from the two indexes to make links like:

- https://playgroundcdn.typescriptlang.org/cdn/3.7.4/monaco/package.json
- https://playgroundcdn.typescriptlang.org/cdn/3.7.4/typescript/package.json

---

### Re-deploying a tag

Delete the local tag, re-create it, and force push it up:

> `git tag -d 3.8.2 && git tag 3.8.2 && git push origin 3.8.2 -f`

Note that npm won't allow re-publishing the same version, so you better do it quick if you need to edit it. The playground doesn't use the npm versions however, so they will get updated.

### Troubleshooting

Are you here because of a failing build? Chances are your issue comes up from a `require` statement inside the TypeScript codebase. 
The logs will let you know if this is the issue.

This has happened a few times, you need to go to [microsoft/monaco-editor](https://github.com/microsoft/monaco-editor) and look at [`./build/importTypeScript.js`](https://github.com/microsoft/monaco-editor/blob/main/build/importTypescript.js). Fix it there (I update the TS version in that repo, then fix the script, and send a PR for just that script change: e.g. [#72](https://github.com/microsoft/monaco-typescript/pull/72)) then come back to the file in this repo: [`./publish-monaco-ts.js`](https://github.com/microsoft/typescript-make-monaco-builds/blob/master/publish-monaco-ts.js) and add a step to merge in your new PR e.g. [#3](https://github.com/microsoft/TypeScript-Make-Monaco-Builds/pull/3).

You can run the following commands to replicate the general behavior without side-effects:

- `SKIP_DEPLOY=1 node ./publish-monaco-editor.js next`

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
