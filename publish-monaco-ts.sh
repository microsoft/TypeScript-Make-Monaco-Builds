# This script takes 2 args which is passed as the TypeScript versions
#
# The first is the version to grab of TypeScript from npm
#
# The second is the version we should use for deploying, if this is
# skipped then the version from TypeScript is used.

TS_VERSION=${1:-next}

 if [ "$1" -eq  "0" ]
   then
     NPM_TAG="--tag nightly"
 else
     NPM_TAG=""
 fi

git clone https://github.com/microsoft/monaco-typescript.git

cd monaco-typescript
npm i

# Set up the monaco to be based on the nightly version
npm install --save "typescript@$TS_VERSION"

# Embed the new build of TS inside monaco-ts
npm run import-typescript

# If a 2nd param is passed use that as the tag for NPM, otherwise
# use the same version as TypeScript
VERSION=${2:-$(json -f node_modules/typescript/package.json version)}

# Match the versions
json -I -f package.json -e "this.version='$VERSION'" 

# Change the name
json -I -f package.json -e "this.name='@typescript-deploys/monaco-typescript'"

npm publish --access public $NPM_TAG
