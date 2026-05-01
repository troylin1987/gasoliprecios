import { execSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';

const packageVersion = process.env.npm_package_version || '0.0.0';
const buildNumber = process.env.GITHUB_RUN_NUMBER || 'local';
const buildDate = new Date().toISOString();

function readGit(command, fallback) {
  try {
    return execSync(command, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return fallback;
  }
}

const commit = process.env.GITHUB_SHA || readGit('git rev-parse HEAD', 'local');
const shortCommit = commit === 'local' ? 'local' : commit.slice(0, 7);
const version = `${packageVersion}.${buildNumber}+${shortCommit}`;

await mkdir('src/generated', { recursive: true });
await writeFile(
  'src/generated/version.js',
  `export const APP_VERSION = ${JSON.stringify(version)};\nexport const BUILD_DATE = ${JSON.stringify(buildDate)};\nexport const BUILD_COMMIT = ${JSON.stringify(commit)};\n`,
);
await writeFile(
  'public/version.json',
  `${JSON.stringify({ version, buildDate, commit }, null, 2)}\n`,
);

console.log(`Generated version ${version}`);
