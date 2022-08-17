"use strict";
import path from "path";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { accessSync, constants } from "fs";
// import pkg from "../../../package.json";
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// reading .../service/.env file.
config({ path: path.join(__dirname, "../../../../../../../.env") });
function accessible(dir, mode) {
    let state = false;
    if (dir.length > 0) {
        // state = true;
        try {
            accessSync(dir, mode);
            state = true;
        }
        catch (err) {
            console.log(err);
            state = false;
        }
    }
    return (state);
}
const FilesystemStream = {
    exists(fileOrDir) {
        const state = false;
        return (state);
    },
    writable(sharedPath) {
        return (accessible(sharedPath, constants.W_OK));
    },
    readable(sharedPath) {
        return (accessible(sharedPath, constants.R_OK));
    },
    validate(dir) {
        let state = false;
        if (dir.length > 0) {
            const pass = dir.match(/^(?:[\w]\:|\\)(\\[a-z|A-Z_\-\s0-9\.]+)+$/gm);
            if (pass)
                state = true;
        }
        return (state);
    }
};
const Utils = {
    /**
     * Capitalize the First letter of the input string.
     *
     * @param {string} origin The string to capitalize
     * @returns string  Capitalized string
     */
    capitalizeFirstLetter([first, ...rest]) {
        const locale = Intl.DateTimeFormat().resolvedOptions().locale;
        return first.toLocaleUpperCase(locale) + rest.join("");
        // return first.toUpperCase() + rest.join("");
    },
    /**
     * Find all the occurrences of {@link search} string and replace them with {@link replace} string.
     *
     * @param {string} origin The string on which replaced sub-string
     * @param {string} search The search string
     * @param {string} replace The replace string
     * @returns {string} Replaced {@link origin} string
     */
    replaceAll(origin, search, replace) {
        return origin.split(search).join(replace);
    },
    /**
     * Find all the occurrence of key contained template string
     * of following format in the passing original string &
     * put replace string on them.
     *
     * format: __{{key}}__
     *
     * @param {string} original The string to format
     * @param {string} key The key which need to format
     * @param {string} replace The replace string
     * @returns {string} Formatted string.
     */
    format(original, key, replace) {
        const tmp = `__{{${key}}}__`;
        return this.replaceAll(original, tmp, replace);
    },
    /**
     * Replica of __filename variable. It'll be used when building
     * nodejs app using ES6 module style, as __filename is not define in
     * case of ES6 module style.
     *
     * @param {string} url provide `import.meta.url` as url.
     *
     * @returns {string} current file name with full-path.
     */
    filename(url) {
        return (fileURLToPath(url));
    },
    /**
     * Replica of __dirname variable. It'll be used when building
     * nodejs app using ES6 module style, as __dirname is not define in
     * case of ES6 module style.
     *
     * @param {string} url provide `import.meta.url` as url.
     *
     * @returns {string} current directory path.
     */
    dirname(url) {
        const name = path.dirname(this.filename(url));
        return (name);
    },
    packageJson() {
        const pkg = require("../../../../package.json");
        return (pkg);
    },
    getEnv(name) {
        if (name && name.length > 0) {
            return (process.env[name]);
        }
        return (undefined);
    },
    cmdUsageHelpMsg(name) {
        if (name) {
            return (`Please check Usage for '${name}' command using below:
$ gtm help ${name}`);
        }
        return ("");
    },
    display(msg) {
        console.log(msg);
    },
    FilesystemStream
};
export { Utils };
//# sourceMappingURL=utility.js.map