/**
 * 过滤图片文件
 * @param {ArrayLike<File>} files
 * @param {string[]} [types]
 */
export const filterImgFiles = (files, types) =>
  types?.length
    ? Array.from(files).filter(({ type }) => types.includes(type))
    : Array.from(files).filter(({ type }) => type.startsWith('image/'));
