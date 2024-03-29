/* eslint no-param-reassign: 0 */

/*
    callback version of https://github.com/knpwrs/webpack-to-memory
    also, not es6
*/


const MemoryFileSystem = require('memory-fs');
const Module = require('module');
const { join } = require('path');

/**
 * @param {object} compiler The WebPack compiler.
 * @param {object} options Options.
 * @param {boolean} [options.source=false] Whether to return source, rather than compile.
 * @return {Promise} A promise resolved with an object of file names mapping to
 * compiled modules.
 */
module.exports = (compiler, options = {}) => new Promise((resolve, reject) => {
  // Compile to in-memory file system.
  const fs = new MemoryFileSystem();
  compiler.outputFileSystem = fs;
  compiler.run((err, stats) => {
    if (err) {
      reject(err);
      return;
    }
    if (stats.hasErrors()) {
      const errors = stats.compilation ? stats.compilation.errors : null;
      reject(errors);
      return;
    }
    const { compilation } = stats;
    // Get the list of files.
    const files = Object.keys(compilation.assets);
    // Read each file and compile module
    const { outputPath } = compiler;
    const output = files.reduce((obj, file) => {
        // Construct the module object
        // Get the code for the module.
        const path = join(outputPath, file);
        const src = fs.readFileSync(path, 'utf8');
        if (options.source) {
          // Add the source to the object.
          obj[file] = src;
        } else {
          const m = new Module();
          m.paths = module.paths;
          // Compile it into a node module!
          m._compile(src, path); // eslint-disable-line no-underscore-dangle
          // Add the module to the object.
          obj[file] = m.exports;
        }
        return obj;
      }, {})
    resolve(output);
  });
});