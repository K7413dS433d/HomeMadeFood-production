// pathResolver docs
/**
 * Resolves a path by combining the base directory with a given path.
 *
 * @param {Object} options - The options object.
 * @param {string} [options.baseDir=process.env.UPLOADS_FOLDER] - The base directory (default is `process.env.BASE_FOLDER`).
 * @param {string} options.path - The relative path to be appended to the base directory.
 * @returns {string} The resolved path in the format `/baseDir/path`.
 */

export const pathResolver = ({ baseDir = process.env.UPLOADS_FOLDER, path }) => {
  return `/${baseDir}/${path}`;
};
