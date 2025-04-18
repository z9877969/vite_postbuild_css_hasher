import fs from 'fs/promises';
import path from 'path';
import random from 'random-string-generator';
import { CLASS_CASH } from './cash.js';
import { readFile, writeFile } from './fs.js';

function generateHash(className) {
  return className + '_' + random('lowernumeric').slice(0, 5);
}

export async function updateHTML(filePath, cssFileName) {
  try {
    let content = await readFile(filePath);
    const classRegex = /class="([^"]*)"/g;
    let match;
    let updatedContent = content;

    while ((match = classRegex.exec(content)) !== null) {
      const originalClassesString = match[1];
      const originalClassesArray = originalClassesString
        .split(/\s+/)
        .filter(Boolean);
      const newClassesArray = [];

      for (const originalClass of originalClassesArray) {
        if (!CLASS_CASH[cssFileName]) {
          CLASS_CASH[cssFileName] = {};
        }
        if (!CLASS_CASH[cssFileName][originalClass]) {
          const hashedClass = generateHash(originalClass);
          CLASS_CASH[cssFileName][originalClass] = hashedClass;
        }
        newClassesArray.push(CLASS_CASH[cssFileName][originalClass]);
      }

      const newClassesString = newClassesArray.join(' ');
      const regexToReplace = new RegExp(
        `class="${originalClassesString.replace(
          /[-\/\\^$*+?.()|[\]{}]/g,
          '\\$&'
        )}"`,
        'g'
      );
      updatedContent = updatedContent.replace(
        regexToReplace,
        `class="${newClassesString}"`
      );
    }

    await writeFile(filePath, updatedContent);
    console.log(`Processed and updated: ${filePath}`);
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}
