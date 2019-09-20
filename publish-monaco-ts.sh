# This script takes an arg which is passed as the TypeScript version
# so, ./publish-monaco-ts.sh 3.6.3 would generate a build for 3.6.3
# it defaults to next for daily builds.

TS_VERSION=${1:-next}

git clone https://github.com/microsoft/monaco-typescript.git

cd monaco-typescript
npm i

# Set up the monaco to be based on the nightly version
npm install --save typescript@$(TS_VERSION)

# Embed the new build of TS inside monaco-ts
npm run import-typescript

# Match the versions
json -I -f package.json -e "this.version='$(json -f node_modules/typescript/package.json version)'" 

# Change the name
json -I -f package.json -e "this.name='@typescript-deploys/monaco-typescript'"

npm publish --access public --tag nightly
