import fs from 'fs/promises';

export const readFile = async filePath => {
  const data = await fs.readFile(filePath, 'utf8');
  return data;
};

export const writeFile = async (filePath, data) => {
  await fs.writeFile(filePath, data, 'utf8');
};

export const getFilesList = async (dirPath, ext) => {
  const dirAllFiles = await fs.readdir(dirPath);
  const filesList = dirAllFiles.filter(el => el.endsWith(ext));
  return filesList;
};
