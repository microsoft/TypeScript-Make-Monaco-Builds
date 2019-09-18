# NOOP for now

# Rough plan:
#
#   Search GH for open PRs with a specific label
#   Per PR
#   - Download all PR comments
#   - Search for the last comment with something like: "https://typescript.visualstudio.com/cf7ac146-d525-443c-b23c-0d58337efebc/_apis/build/builds/43964/artifacts?artifactName=tgz&fileId=3AF21D4D4FC0F9A349D943EEA8D0975B1F7FB2E974C87B30467B3F4A1F0AFD2B02&fileName=/typescript-3.7.0-insiders.20190913.tgz"
#
#   With the list of PR builds
#   filter list if the zip versions are the same as currently published
#
#   Then deploy a version of monaco-ts + monaco per un-published version
#   Ship a JSON file to npm with the list of PRs
#
#   Get the playground to read that json file from unpkg then it knows
#   all available PR based playgrounds.
