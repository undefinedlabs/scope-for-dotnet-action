const core = require('@actions/core');
const exec = require('@actions/exec');
const path = require('path')
const fs = require('fs')

const SCOPE_DSN = 'SCOPE_DSN';

async function run() {
  try {
    const homePath = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;

    const command = core.getInput('command') || 'dotnet test';
    const dsn = core.getInput('dsn') || process.env[SCOPE_DSN];
    const useSolutions = core.getInput('use-solutions') || true;

    if (!dsn) {
      throw Error('Cannot find the Scope DSN');
    }

    console.log(`Command: ${command}`);
    console.log(`Use solutions: ${useSolutions}`);
    if (dsn) {
      console.log(`DSN has been set.`);
    }

    await exec.exec('dotnet tool install -g ScopeAgent.Runner --version 0.1.16-beta.2', null, { ignoreReturnCode: true });

    if (useSolutions) {
      const slnFiles = findFileByExtension(process.cwd(), "sln");
      if (slnFiles.length > 0) {
        for(let i = 0; i < slnFiles.length; i++) {
          const slnFolder = path.dirname(slnFiles[i]);
          await ExecScopeRun(homePath, command, slnFolder, apiKey, dsn);
        }
        return;
      }
    } 

    await ExecScopeRun(homePath, command, process.cwd(), apiKey, dsn);  

  } catch (error) {
    core.setFailed(error.message);
  }
}

async function ExecScopeRun(homePath, command, cwd, apiKey, dsn) {
  let envVars = Object.assign({}, process.env);
  if (apiKey) {
    envVars[SCOPE_APIKEY] = apiKey;
  }
  if (dsn) {
    envVars[SCOPE_DSN] = dsn;
  }
  await exec.exec(`${homePath}/.dotnet/tools/scope-run`, [ command ], {
    cwd: cwd,
    env: envVars
  });
}

function findFileByExtension(base, ext, files, result) {
    files = files || fs.readdirSync(base);
    result = result || [];
    files.forEach( 
        function (file) {
            const newbase = path.join(base, file);
            if (fs.statSync(newbase).isDirectory()) {
              result = findFileByExtension(newbase, ext, fs.readdirSync(newbase), result);
            } else {
                if (file.substr(-1*(ext.length+1)) == '.' + ext) {
                    result.push(newbase)
                } 
            }
        }
    )
    return result
}

run();