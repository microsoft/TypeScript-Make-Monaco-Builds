// @ts-check

const { execSync } = require("child_process");

let hasError = false;

const FailMode = {
  Optional: 0,
  Required: 1,
  Fatal: 2,
};

function exec(cmd, opts) {
  return baseExec(cmd, opts, FailMode.Fatal);
}
exec.try = (cmd, opts) => baseExec(cmd, opts, FailMode.Optional);
exec.continueOnError = (cmd, opts) => baseExec(cmd, opts, FailMode.Required);
exec.hasError = () => hasError;
module.exports = exec;

function baseExec(cmd, opts, failMode) {
  console.log(`> ${cmd} ${opts ? JSON.stringify(opts) : ""}`);
  try {
    return execSync(cmd, opts);
  } catch (error) {
    if (failMode === FailMode.Fatal) {
      throw error;
    }
    if (failMode === FailMode.Required) {
      hasError = true;
    }
    console.error(error.message);
  }
}
