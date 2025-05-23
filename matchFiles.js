import { BASE_PATH_KEY, ROOT_DIR } from './constants.js';
import path from 'path';
import { getFilesList, readFile } from './fs.js';
import { FILES_CASH, PATH_CASH } from './cash.js';

const cssFileRegex = /[\w-]+\.css/g;
const cssRowRegex =
  /<link\s+[^>]*?href=["'](?!https?:\/\/)([^"']*(styles)?[\w-]*\.css)["'][^>]*?>/gi;

const findCssFile = fileData => {
  const cssRows = fileData.match(cssRowRegex);
  if (!cssRows) return null;
  // const cssFileMatch = cssRow[0].match(cssFileRegex);
  const cssFileMatch = cssRows.map(row => row.match(cssFileRegex));
  return cssFileMatch.length ? cssFileMatch.map(([row]) => row) : null;
};

const findJsFile = fileData => {
  const jsRowRegex =
    /<script\s+type="module"[^>]*?src=["']([^"']*\.js)["'][^>]*?>/g;
  const jsRows = fileData.match(jsRowRegex);
  if (!jsRows) return null;
  const pathesList = jsRows
    .map(row => {
      const matchData = row.match(/src=["']([^"']*\.js)["']/);
      if (!matchData) return null;
      let jsPath = matchData[1];
      if (jsPath.startsWith('/' + PATH_CASH[BASE_PATH_KEY])) {
        const basePathLength = PATH_CASH[BASE_PATH_KEY].length;
        jsPath = jsPath.slice(basePathLength + 1);
      }
      return jsPath || null;
    })
    .filter(jsPath => {
      return jsPath && !jsPath.includes('modulepreload');
    })
    .map(jsPath => path.join(ROOT_DIR, jsPath));

  return pathesList.length ? pathesList : null;
};

export const matchFiles = async () => {
  const htmlFiles = await getFilesList(ROOT_DIR, '.html');
  for await (const file of htmlFiles) {
    const filePath = path.join(ROOT_DIR, file);
    const fileData = await readFile(filePath);
    let cssFile = findCssFile(fileData);
    if (cssFile) {
      cssFile = cssFile.filter(file => !file.includes('vendor'));
      cssFile = cssFile[0];
      if (!FILES_CASH[cssFile]) {
        FILES_CASH[cssFile] = [];
      }
      FILES_CASH[cssFile].push(filePath);
    }
    const jsFiles = findJsFile(fileData);

    if (jsFiles) {
      if (!FILES_CASH[file]) {
        FILES_CASH[file] = [];
      }
      FILES_CASH[file].push(...jsFiles);
    }
  }
  return FILES_CASH;
};
