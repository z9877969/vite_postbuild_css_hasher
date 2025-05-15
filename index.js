import path from 'path';
import { FILES_CASH, PATH_CASH } from './cash.js';
import { matchFiles } from './matchFiles.js';
import { updateHTML } from './updateHtml.js';
import { updateCss } from './updateCss.js';
import { updateJs } from './updateJs.js';
import { getBasePath } from './getBasePath.js';
import { BASE_PATH_KEY } from './constants.js';

const update = async () => {
  const basePath = getBasePath();

  PATH_CASH[BASE_PATH_KEY] = basePath;

  await matchFiles();

  const filesCashList = Object.entries(FILES_CASH);
  for await (const [cssFile, htmlFilesList] of filesCashList) {
    if (path.parse(cssFile).ext !== '.css') continue;
    for await (const htmlFilePath of htmlFilesList) {
      await updateHTML(htmlFilePath, cssFile);
      const htmlFile = htmlFilePath.split('/').pop();
      if (FILES_CASH[htmlFile]) {
        const jsPathes = FILES_CASH[htmlFile];

        for await (const jsPath of jsPathes) {
          await updateJs(cssFile, jsPath);
        }
      }
    }
    await updateCss(cssFile);
  }
};

update();
