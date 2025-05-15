import path from 'path';
import { readFile, writeFile } from './fs.js';
import { ROOT_DIR } from './constants.js';
import { CLASS_CASH } from './cash.js';

const getHashedCss = async (cssFile, cssContent) => {
  try {
    const classRegex = /(?<!:)\.([a-zA-Z_-][a-zA-Z0-9_-]*)/g;

    let match;

    while ((match = classRegex.exec(cssContent)) !== null) {
      const originalClassName = match[1];
      const matchPosition = match.index;
      const matchLength = match[1].length;
      const hashedClassName = CLASS_CASH[cssFile][originalClassName];

      if (hashedClassName) {
        const startCuttingStr = cssContent.substring(0, [matchPosition + 1]);
        const endCuttingClass = cssContent.substring(
          [matchPosition + 1 + matchLength],
          cssContent.length
        );
        cssContent = startCuttingStr + hashedClassName + endCuttingClass;
      }
    }

    console.log(`Updated class names: ${cssFile}`);
    return cssContent;
  } catch (error) {
    console.error(`Error updating class names of the file  ${cssFile}:`, error);
  }
};

export const updateCss = async cssFile => {
  if (cssFile.includes('vendor')) return;
  const cssPath = path.resolve(ROOT_DIR, 'assets', cssFile);
  const fileData = await readFile(cssPath);
  const updatedFileData = await getHashedCss(cssFile, fileData);
  await writeFile(cssPath, updatedFileData);
};
