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
