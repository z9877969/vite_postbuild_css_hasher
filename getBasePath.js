export const getBasePath = () => {
  const basePath =
    process.argv
      .find((el) => el.startsWith('--base'))
      ?.split('=')
      .pop() || null;
  if (!basePath) return '';
  const length = basePath.length;
  return basePath.slice(1, length - 1);
};
