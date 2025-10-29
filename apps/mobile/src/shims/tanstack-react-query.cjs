/**
 * CommonJS passthrough shim for @tanstack/react-query
 * Avoids ESM/CJS interop issues by directly re-exporting the legacy build
 */
module.exports = require('../../../../node_modules/@tanstack/react-query/build/legacy/index.cjs');
