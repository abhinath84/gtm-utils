"use strict";
// import standard & node_modules
import { existsSync } from "fs";
import * as fsp from "fs/promises";
import * as path from "path";
import cp from "child_process";
import util from "util";
// import project modules
import { Utils } from "../utils/utility.js";
import { loadModule } from "../utils/esm.js";
import { UsageError } from "../core/errors.js";
const __dirname = Utils.dirname(import.meta.url);
function getTestFiles(testFilepath) {
    return (fsp.readdir(testFilepath)
        // TODO: replace 'file.indexOf('.test.js') !== -1)' with RegExp match mechanism.
        .then((files) => files.filter((file) => file.indexOf(".test.js") !== -1)));
}
function buildImport(data) {
    const importPath = `../../tests/modules/${data.path}`;
    if (data.testSuites.length === 1) {
        return (`import { ${data.testSuites[0]} } from "${importPath}";`);
    }
    let content = "import {";
    data.testSuites.forEach((element, index) => {
        const suite = `\n\t${element}${index < (data.testSuites.length - 1) ? "," : ""}`;
        content += suite;
    });
    content += `\n} from "${importPath}";`;
    return (content);
}
function buildImportSection(data) {
    if (data.length > 0) {
        let content = "";
        data.forEach((element) => {
            element.sub.forEach((sub) => {
                content += `${buildImport(sub)}\n`;
            });
        });
        return (content);
    }
    throw (new TypeError("Object imported from test modules are empty."));
}
function buildPackage(data) {
    let content = "";
    data.forEach((sub, index) => {
        if (data.length > 1)
            content += `\n\t\t"${sub.name}": {`;
        sub.testSuites.forEach((element, inx) => {
            content += `\n${(data.length > 1) ? "\t\t\t" : "\t\t"}`;
            content += `${element}${inx < (sub.testSuites.length - 1) ? "," : ""}`;
        });
        if (data.length > 1)
            content += "\n\t\t}";
        content += `${index < (data.length - 1) ? "," : ""}`;
    });
    return (content);
}
function buildPackageSection(data) {
    let content = "// Test suite to use in nodejs application.\n";
    content += "const packages = {";
    data.forEach((element, index) => {
        if (element.sub.length > 0) {
            content += `\n\t"${element.module}": {`;
            // loop over testSuites
            content += buildPackage(element.sub);
            content += `\n\t}${index < (data.length - 1) ? "," : ""}`;
        }
    });
    content += "\n};";
    return (content);
}
class NodeSupportSystem {
    constructor() {
        this._testModulesFilename = "testmodules.js";
        // .../csunit/app/cli/ directory path
        this._cli = path.join(__dirname, "../../");
        // .../csunit/tests/modules directory path
        this._tests = path.join(this._cli, "../../tests/modules");
        // .../csunit/src/export directory path
        this._destination = path.join(this._cli, "../../src/export");
    }
    exists() {
        return existsSync(this._destination);
    }
    async generatePackage() {
        if (this.exists()) {
            if (existsSync(this._tests)) {
                // get /tests/ directory.
                const modules = await this._getTestModules();
                const suites = await this._importTestModuleData(modules);
                return (this._updatePackageInfo(suites));
            }
            return (Promise.reject(new UsageError(`Tests directory '${this._tests}' is missing`)));
        }
        return (Promise.reject(new UsageError(`Destination directory '${this._destination}' is missing`)));
    }
    listTestModules() {
        if (this.exists()) {
            if (existsSync(this._tests)) {
                return (this._getTestModules());
            }
            return (Promise.reject(new UsageError(`Tests directory '${this._tests}' is missing`)));
        }
        return (Promise.reject(new UsageError(`Destination directory '${this._destination}' is missing`)));
    }
    runModule(module) {
        // check string & empty
        if (module !== "") {
            // convert to lower case
            const moduleName = module.toLowerCase();
            // check module present or not
            const modulePath = path.join(this._tests, moduleName);
            if (existsSync(modulePath)) {
                const filename = path.join(modulePath, "index.js");
                // execute test module.
                const forkAsync = util.promisify(cp.fork);
                return (forkAsync(filename, undefined, undefined));
            }
            return (Promise.reject(new UsageError(`'${moduleName}' does not exists inside '${this._tests}' test directory`)));
        }
        return (Promise.reject(new TypeError("Invalid input - module")));
    }
    async runAllModules() {
        if (existsSync(this._tests)) {
            const modules = await this._getTestModules();
            if (modules.length > 0) {
                const execAsync = util.promisify(cp.exec);
                const promises = modules.map((module) => {
                    const filename = path.join(this._tests, module, "index.js");
                    // TODO: replace cp.exec with cp.execFile, which might resolve below TODO.
                    // TODO: need to update 'cmd' based on OS support.
                    // const cmd = (process.platform === "win32") ? `start cmd.exe @cmd /k "node ${filename}"`
                    //   : (process.platform === "linux") ? ""
                    //     : (process.platform === "darwin") ? "" : "";
                    let cmd;
                    if (process.platform === "win32") {
                        cmd = `start cmd.exe @cmd /k "node ${filename}"`;
                    }
                    else if (process.platform === "linux") {
                        cmd = "";
                    }
                    else if (process.platform === "darwin") {
                        cmd = "";
                    }
                    else {
                        cmd = "";
                    }
                    return (execAsync(cmd));
                });
                return (Promise.all(promises));
            }
            return (Promise.reject(new TypeError(`No test module inside '${this._tests}' directory.
Either there is no test module or internal error.`)));
        }
        return (Promise.reject(new TypeError(`Tests directory '${this._tests}' is missing.
Either there is no test directory or internal error.`)));
    }
    _getTestModules() {
        return (fsp.readdir(this._tests, { withFileTypes: true })
            .then((dirs) => (dirs
            .filter((dir) => dir.isDirectory() && (dir.name !== "home"))
            .map((dir) => dir.name))));
    }
    async _importTestModuleData(modules) {
        if (modules.length > 0) {
            const promises = modules.map(async (moduleName) => {
                const modulePath = path.join(this._tests, moduleName);
                // get all *.tets.js files.
                const testFiles = await getTestFiles(modulePath);
                // loop over it & generate ImportSubObject.
                const genPromises = testFiles.map((testFile) => this._generateImportSubObj(moduleName, testFile));
                const subObjects = await Promise.all(genPromises);
                const importObj = {
                    module: moduleName,
                    sub: subObjects
                };
                return (Promise.resolve(importObj));
            });
            return (Promise.all(promises));
        }
        return (Promise.reject(new TypeError(`'modules' input is empty.
Either there is no test module in 'csunit/test' directory or internal error.`)));
    }
    _updatePackageInfo(data) {
        const filename = path.join(this._destination, this._testModulesFilename);
        // header information.
        let content = "// AUTOGENERATED (remove AUTOGENERATED in the first line to prevent auto-generation,";
        content += "restore AUTOGENERATED to enable it back)\n\n";
        content += "'use strict';\n\n";
        // import section
        content += buildImportSection(data);
        // interval
        content += "\n\n";
        // package object section
        content += buildPackageSection(data);
        // export section.
        content += "\n\n";
        content += "export default packages;\n";
        return fsp.writeFile(filename, content)
            .then(( /* response */) => Promise.resolve(`Created/Updated node package file '${filename}'.`));
    }
    _generateImportSubObj(moduleName, filename) {
        let filePath = path.join(this._tests, moduleName);
        filePath = path.join(filePath, filename);
        return (loadModule(filePath)
            .then((module) => {
            const suites = [];
            Object.keys(module).forEach((elem) => suites.push(elem));
            const subObj = {
                path: `${moduleName}/${filename}`,
                name: filename.substring(0, filename.indexOf(".")),
                testSuites: suites
            };
            return (Promise.resolve(subObj));
        }));
    }
}
const NodeSupport = {
    generatePackage() {
        const nss = new NodeSupportSystem();
        return (nss.generatePackage());
    },
    listTestModules() {
        const nss = new NodeSupportSystem();
        return (nss.listTestModules());
    },
    runModule(module) {
        const nss = new NodeSupportSystem();
        return (nss.runModule(module));
    },
    runAllModules() {
        const nss = new NodeSupportSystem();
        return (nss.runAllModules());
    }
};
export { NodeSupport };
//# sourceMappingURL=node.js.map