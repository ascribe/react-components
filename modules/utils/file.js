/**
 * Extracts a file extension from a string, by splitting by dot and taking
 * the last substring
 *
 * If a file without an extension is submitted (file), then
 * this method just returns an empty string.
 * @param  {string} s file's name + extension
 * @return {string}   file extension
 *
 * Via: http://stackoverflow.com/a/190878/1263876
 */
export function extractFileExtensionFromString(s) {
    const explodedFileName = s.split('.');
    return explodedFileName.length > 1 ? explodedFileName.pop()
                                       : '';
}
