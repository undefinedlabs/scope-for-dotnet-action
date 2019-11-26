const core = require('@actions/core');
const exec = require('@actions/exec');

const SCOPE_APIKEY = 'SCOPE_APIKEY';
const SCOPE_DSN = 'SCOPE_DSN';

async function run() {
  try {
    const homePath = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;

    let command = core.getInput('command') || 'dotnet test';
    let apiKey = core.getInput('apikey') || process.env[SCOPE_APIKEY];
    let dsn = core.getInput('dsn') || process.env[SCOPE_DSN];

    if (!dsn && !apiKey) {
      throw Error('Cannot find the DSN or ApiKey');
    }

    console.log(`Command: ${command}`);
    if (dsn) {
      console.log(`DSN: ${dsn}`);
    }
    if (apiKey) {
      console.log(`ApiKey: ${apiKey}`);
    }

    await exec.exec('dotnet --info');
    await exec.exec('dotnet tool install -g ScopeAgent.Runner', null, {
      ignoreReturnCode: true
    });
    await exec.exec(`${homePath}/.dotnet/tools/scope-run`, [ command, '--debug' ], {
      cwd: process.cwd(),
      env: {
        SCOPE_APIKEY : apiKey,
        SCOPE_DSN : dsn,
      }
    })
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();