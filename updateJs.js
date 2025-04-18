import { readFile, writeFile } from './fs.js';
import { CLASS_CASH } from './cash.js';

const getHashedClassesJs = async (cssFile, jsContent, jsFile) => {
  try {
    const classSelectorRegex = /\.([\w-]+)/g;
    let match;

    while ((match = classSelectorRegex.exec(jsContent)) !== null) {
      const originalClassName = match[1];
      const matchPosition = match.index;
      const matchLength = match[1].length;
      const hashedClassName = CLASS_CASH[cssFile][originalClassName];

      if (hashedClassName) {
        const startCuttingStr = jsContent.substring(0, [
          matchPosition + 1,
        ]);
        const endCuttingClass = jsContent.substring(
          [matchPosition + 1 + matchLength],
          jsContent.length
        );
        jsContent = startCuttingStr + hashedClassName + endCuttingClass;
      }
    }

    console.log(`Updated class names: ${jsFile}`);
    return jsContent;
  } catch (error) {
    console.error(
      `Error updating class names of the file  ${jsFile}:`,
      error
    );
  }
}

export const updateJs = async (cssFile, jsPath) => {
  const fileData = await readFile(jsPath);
  const jsFile = jsPath.split("/").pop();
  const updatedFileData = await getHashedClassesJs(cssFile, fileData, jsFile);
  await writeFile(jsPath, updatedFileData);
};

