import { readFile, writeFile } from './fs.js';
import { CLASS_CASH } from './cash.js';

const classSelectorRegex =
  /(?:querySelector(?:All)?|classList\.(?:add|remove|toggle|contains))\(['"`]\.?([\w-]+)\s*\.?[\w-]*['"`]\)/g;

const getHashedClassesJs = async (cssFile, jsContent, jsFile) => {
  try {
    let match;
    const matches = [];

    console.log('CLASS_CASH :>> ', CLASS_CASH);

    while ((match = classSelectorRegex.exec(jsContent)) !== null) {
      const originalClassName = match[1];
      if (
        originalClassName &&
        CLASS_CASH[cssFile] &&
        CLASS_CASH[cssFile][originalClassName]
      ) {
        matches.push({
          original: originalClassName,
          hashed: CLASS_CASH[cssFile][originalClassName],
          index: match.index + match[0].indexOf(originalClassName),
          length: originalClassName.length,
        });
      }
    }

    // Сортуємо співпадіння за індексом у зворотному порядку, щоб уникнути проблем зі зсувом при заміні
    matches.sort((a, b) => b.index - a.index);

    let updatedJsContent = jsContent;
    for (const m of matches) {
      const startIndex = m.index;
      const endIndex = startIndex + m.length;
      updatedJsContent =
        updatedJsContent.substring(0, startIndex) +
        m.hashed +
        updatedJsContent.substring(endIndex);
    }

    console.log(`Updated class names: ${jsFile}`);
    return updatedJsContent;
  } catch (error) {
    console.error(`Error updating class names of the file  ${jsFile}:`, error);
  }
};

export const updateJs = async (cssFile, jsPath) => {
  const fileData = await readFile(jsPath);
  const jsFile = jsPath.split('/').pop();
  const updatedFileData = await getHashedClassesJs(cssFile, fileData, jsFile);
  await writeFile(jsPath, updatedFileData);
};
