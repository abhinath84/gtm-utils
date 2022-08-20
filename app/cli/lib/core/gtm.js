"use strict";
// import node in-build or node_modules modules.
import fs from "fs";
import path from "path";
import chalk from "chalk";
import figlet from "figlet";
import { parseProgram } from "./commands.js";
import { Utils } from "../utils/utility.js";
import { errorHandler } from "./errors.js";
import { loadModule } from "../utils/esm.js";
// const __filename = Utils.filename();
const __dirname = Utils.dirname(import.meta.url);
const cmdDirs = path.join(__dirname, "../cmd");
const api = {};
const cli = {};
// It makes sense to ensure that lounger was bootstrapped properly,
// especially for programmatic use.
// To keep track of the async bootstrapping `status`, we set `lounger.loaded` to `false`.
export const gtm = {
    isLoaded: false,
    version: Utils.packageJson().version,
};
function showFiglet() {
    // clear();
    // TODO: pad according to shell window width.
    const figletText = figlet.textSync("   UIGTM-UTILS", { horizontalLayout: "full" });
    console.log(chalk.cyan(`${figletText}v${gtm.version}`));
    console.log("\n");
}
// TODO: replace value: any to value: Object|Function
function register(parent, child, cmd) {
    if (Object.prototype.toString.call(child) === "[object Function]" || typeof child === "function") {
        parent[cmd] = child; // eslint-disable-line no-param-reassign
    }
    else if (Object(child) === child) {
        Object.keys(child).forEach((key) => {
            if (Object.prototype.toString.call(child[key]) === "[object Function]" || typeof child[key] === "function") {
                parent[key] = child[key]; // eslint-disable-line no-param-reassign
            }
        });
    }
}
function loadCmds(files) {
    if (files && files.length > 0) {
        const jsFiles = files.filter((file) => file.match(/(.*)\.js$/));
        // load modules
        const promises = jsFiles.map((jsFile) => loadModule(path.resolve(cmdDirs, jsFile)).then((module) => ({
            cmd: jsFile.match(/(.*)\.js$/)[1],
            mod: module,
        })));
        return Promise.all(promises).then((responses) => {
            responses.forEach((response) => {
                if (response.mod.cli) {
                    register(cli, response.mod.cli, response.cmd);
                }
                if (response.mod.api) {
                    register(api, response.mod.api, response.cmd);
                }
            });
            return Promise.resolve(true);
        });
    }
    return Promise.reject(new TypeError("Unable to load commands."));
}
function loadCallback() {
    return new Promise((resolve, reject) => {
        fs.readdir(cmdDirs, (err, files) => {
            if (err) {
                reject(err);
            }
            else {
                loadCmds(files)
                    .then((loaded) => {
                    gtm.isLoaded = loaded;
                    if (loaded)
                        return resolve(gtm);
                    return reject(new TypeError("Fail to load command modules."));
                })
                    .catch(reject);
            }
        });
    });
}
function parseCallback() {
    return parseProgram();
}
function actionCallback(cmd, options) {
    showFiglet();
    // check
    if (cli[cmd]) {
        cli[cmd].apply(null, [options]).catch(errorHandler);
    }
    else {
        throw new TypeError(`${cmd} is not present in 'gtm' module.`);
    }
}
// Assigning functions to gtm object.
gtm.load = loadCallback;
gtm.parse = parseCallback;
gtm.action = actionCallback;
Object.defineProperty(gtm, "commands", {
    get: () => {
        if (gtm.isLoaded === false) {
            throw new Error("run gtm.load before");
        }
        return api;
    },
});
Object.defineProperty(gtm, "cli", {
    get: () => {
        if (gtm.isLoaded === false) {
            throw new Error("run gtm.load before");
        }
        return cli;
    },
});
//# sourceMappingURL=gtm.js.map