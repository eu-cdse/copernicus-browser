import semver from 'semver';
import { execSync } from 'child_process';
import pckg from '../package.json';

const requiredNodeVersion = pckg.engines.node;
const actualNodeVersion = process.version;
const redTextColor = '\x1b[31m';
const greenTextColor = '\x1b[32m';
const resetColor = '\x1b[0m';

/* eslint-disable-next-line no-console */
const consoleLogWithColors = (text, color) => console.log(color, text, resetColor);

if (!semver.satisfies(actualNodeVersion, requiredNodeVersion)) {
  consoleLogWithColors(
    `Currently used node version ${actualNodeVersion} is not one of the required node versions ${requiredNodeVersion}\n`,
    redTextColor,
  );
  process.exit(1);
}

const requiredNpmVersion = pckg.engines.npm;
const actualNpmVersion = execSync('npm -v', { encoding: 'utf-8' });
if (!semver.satisfies(actualNpmVersion, requiredNpmVersion)) {
  consoleLogWithColors(
    `Currently used npm version ${actualNpmVersion} is not one of the required npm versions ${requiredNpmVersion}\n`,
    redTextColor,
  );
  process.exit(1);
}

consoleLogWithColors('Versions check ended successfully', greenTextColor);
