"use strict";
function isBrowser() {
    return ((typeof window !== "undefined")
        && (Object.prototype.toString.call(window) === "[object Window]"));
}
function isNode() {
    return ((typeof global !== "undefined")
        && (Object.prototype.toString.call(global) === "[object global]"));
}
async function loadModule(filename) {
    if (isBrowser()) {
        return (import(filename));
    }
    // Node.js 12.0.0 has node_module_version=72
    // https://nodejs.org/en/download/releases/
    // const nodeVint = process.config.variables.node_module_version;
    // The dynamic import() keyword supports both CommonJS files
    // (.js, .cjs) and ESM files (.mjs), so we could simply use that unconditionally on
    // newer Node versions, regardless of the given file path.
    //
    // But:
    // - Node.js 12 emits a confusing "ExperimentalWarning" when using import(),
    //   even if just to load a non-ESM file. So we should try to avoid it on non-ESM.
    // - This Node.js feature is still considered experimental so to avoid unexpected
    //   breakage we should continue using require(). Consider flipping once stable and/or
    //   as part of QUnit 3.0.
    // - Plugins and CLI bootstrap scripts may be hooking into require.extensions to modify
    //   or transform code as it gets loaded. For compatibility with that, we should
    //   support that until at least QUnit 3.0.
    // - File extensions are not sufficient to differentiate between CJS and ESM.
    //   Use of ".mjs" is optional, as a package may configure Node to default to ESM
    //   and optionally use ".cjs" for CJS files.
    //
    // https://nodejs.org/docs/v12.7.0/api/modules.html#modules_addenda_the_mjs_extension
    // https://nodejs.org/docs/v12.7.0/api/esm.html#esm_code_import_code_expressions
    try {
        return require(filename); // eslint-disable-line global-require, import/no-dynamic-require
    }
    catch (e) {
        if (((e.code === "ERR_REQUIRE_ESM"
            || (e instanceof SyntaxError
                && e.message === "Cannot use import statement outside a module")))
            || (e.message === "require is not defined")) {
            // Resolving 'Error [ERR_UNSUPPORTED_ESM_URL_SCHEME]' issue.
            const path = await import("path");
            if (path.isAbsolute(filename)) {
                const { pathToFileURL } = await import("url");
                return import(pathToFileURL(filename).href);
            }
            return import(filename);
        }
        throw e;
    }
}
export { loadModule };
//# sourceMappingURL=esm.js.map