# Monaco Daily Builds

Uses [GitHub Actions](.github/workflows) to deploy builds of both [monaco-typescript](https://github.com/Microsoft/monaco-typescript) and [monaco-editor](https://github.com/Microsoft/monaco-editor) using TypeScript nightly builds.

These live inside typescript-deploys account on npm, credentials are in the JSTS Azure Keyvault.

See the module releases ([monaco-typescript](https://www.npmjs.com/package/@typescript-deploys/monaco-typescript), [monaco-editor](https://www.npmjs.com/package/@typescript-deploys/monaco-editor) - click 'versions'), [GitHub releases](https://github.com/orta/make-monaco-builds/releases) & [daily script](.github/workflows/main.yml).

### Pull Request Builds

An external system can trigger a pull request build for any Pull Request. It can handle
multiple builds in the same PR. These are triggered via HTTP requests which have a
GitHub auth token

This workflow is triggered from an API call where XXX is your token
and YYY is the PR that it should look at.

```
curl https://api.github.com/repos/orta/make-monaco-builds/dispatches \
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

### CDN'd

Every release has a corresponding upload to [azure blob storage](https://ms.portal.azure.com/#@microsoft.onmicrosoft.com/resource/subscriptions/57bfeeed-c34a-4ffd-a06b-ccff27ac91b8/resourceGroups/Playground-Static-Hosting/providers/Microsoft.Storage/storageAccounts/tswebinfra/overview) of:

- the NPM module contents of the TypeScript version (so you can grab lib files)
- the NPM module contents of monaco-typescript, so playgrounds can use custom builds of typescript

There is an index of all uploaded TypeScript and Monaco-Editor [version here](https://tswebinfra.blob.core.windows.net/indexes/indexes.json). It's important to note that Monaco Editor is indexed by the version of TypeScript it supports - not the version of the monaco-editor package.

- Releases: [`https://tswebinfra.blob.core.windows.net/indexes/releases.json`](https://tswebinfra.blob.core.windows.net/indexes/releases.json)
- Pre-Releases: [`https://tswebinfra.blob.core.windows.net/indexes/pre-releases.json`](https://tswebinfra.blob.core.windows.net/indexes/pre-releases.json)

You can use the values from the two indexes to make links like:

- https://tswebinfra.blob.core.windows.net/cdn/3.7.4/monaco/package.json
- https://tswebinfra.blob.core.windows.net/cdn/3.7.4/typescript/package.json
