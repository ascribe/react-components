/**
 * FineUploader allows us to specify the file extensions that are allowed to upload.
 * For our self defined input, we can reuse those declarations to restrict which files
 * the user can pick from his hard drive.
 *
 * Takes an array of file extensions (['pdf', 'png', ...]) and transforms them into a string
 * that can be passed into an html5 input via its 'accept' prop. As an optional parameter,
 * this function also accepts a mime type mapping from an extension to a mime type as Safari
 * and some older browsers don't support just the extension on their input elements.
 * @param  {array}    allowedExtensions Array of strings without a dot prefixed
 * @param  {(object)} mimeTypeMap       Mapping of extension to mime type
 * @return {string}                     The passed-in array's representation as an accept property
 *                                      (comma-seperated string of values)
 */
export function transformAllowedExtensionsToInputAcceptProp(allowedExtensions, mimeTypeMap) {
    // Get the mime type of the extension if it's defined or add a dot in front of the extension
    const prefixedAllowedExtensions = allowedExtensions.map((ext) => {
        return (mimeTypeMap && mimeTypeMap[ext]) || ('.' + ext);
    });

    // generate a comma separated list to add them to the DOM element
    // See: http://stackoverflow.com/questions/4328947/limit-file-format-when-using-input-type-file
    return prefixedAllowedExtensions.join(', ');
}
