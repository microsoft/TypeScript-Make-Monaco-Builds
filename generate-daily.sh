# for manipulating the package.jsons
npm install -g json

# for shipping to npm
echo //registry.npmjs.org/:_authToken=${NPM_TOKEN} > .npmrc

### Set up Monaco TypeScript first

# clone & setup
git clone https://github.com/microsoft/monaco-typescript.git
cd monaco-typescript
npm i

# set up the monaco to be based on the nightly version
npm run run-nightly

json -I -f package.json -e "this.name='@orta/monaco-typescript'"
npm publish --access public

# Keep a var of the version so we can hook monaco editor to it later
MONACO_TS_VERSION=$(json -f package.json version)
cd ..

### Setup Monaco For a Deploy

git clone https://github.com/microsoft/monaco-editor.git
cd monaco-editor

json -I -f package.json -e "this.name='@orta/monaco-editor'" 
yarn add monaco-typescript@npm:@orta/monaco-typescript@$MONACO_TS_VERSION

# Create a release build, this makes a new sub-folder called release
gulp release
cd release
npm publish --access public


## These may be useful again in the future

#  Maybe not needed if yarn aliasing can work instead
# json -I -f package.json -e "this.devDependencies['monaco-typescript']=undefined"
# json -I -f package.json -e "this.devDependencies['@orta/monaco-typescript']='$MONACO_TS_VERSION'"
# sed -i '' 's/node_modules\/monaco-typ/node_modules\/@orta\/monaco-typ/g' metadata.js

# Don't think this is needed for our re-deploys
# cd ..
# git clone https://github.com/microsoft/vscode-loc
# git clone https://github.com/microsoft/vscode
# cd vscode 
# yarn
# yarn build
