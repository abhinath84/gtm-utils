"use strict";
// import standard & node_modules
import { existsSync, mkdirSync } from "fs";
import * as fsp from "fs/promises";
import * as path from "path";
// import project modules
import { Utils } from "../utils/utility.js";
import { UsageError } from "../core/errors.js";
const __dirname = Utils.dirname(import.meta.url);
// const __filename = Utils.filename(import.meta.url);
// check user already provide .test.js as file name.
// - invalid filename: abc.js
// - invalid filename: abc.test
function validateTestFile(filename) {
    let status = false;
    if (filename.includes(".")) {
        // TODO: can be replaced below code using regexp.
        const search = ".test.js";
        const lastIndex = filename.lastIndexOf(search);
        // if -1 then wrong file.
        if (lastIndex !== -1) {
            const filenameLen = filename.length;
            const searchLen = search.length;
            if (filenameLen === (searchLen + lastIndex)) {
                status = true;
            }
        }
    }
    else {
        status = true;
    }
    return (status);
}
function getTestFileName(name) {
    let modifiedName = "";
    const index = name.lastIndexOf(".test.js");
    if (index > -1) {
        modifiedName = name.substring(0, index);
    }
    else {
        modifiedName = name;
    }
    return (modifiedName);
}
class TestFileSystem {
    constructor(dirname) {
        // application will convert folder name to lower-case to maintain similarities.
        this._dirname = dirname.toLowerCase();
        // ./csunit/app/cli/ directory path
        this._cli = path.join(__dirname, "../../");
        // ./csunit/app/cli/templates/ directory path
        this._templates = path.join(this._cli, "/templates");
        // ./csunit/tests/modules directory path
        this._destination = path.join(this._cli, "../../tests/modules");
        this._destination = path.join(this._destination, this._dirname);
    }
    exists() {
        return existsSync(this._destination);
    }
    createDir() {
        return (this.destination()
            .then(( /* response */) => {
            const promises = [
                this.layout(),
                this.script(),
                this.testScript(this._dirname),
                this.updateTestModules(this.addModule) // update 'csunit/tests/home/script.js'
            ];
            return Promise.all(promises);
        }));
    }
    removeDir() {
        // check dirname exists or not.
        if (this.exists()) {
            // if yes delete dirname.
            return (fsp.rm(this._destination, { recursive: true })
                .then(async () => {
                // remove entry from '/home/index.js'.
                await this.updateTestModules(this.removeModule);
                return (Promise.resolve(`'${this._dirname}' module removed successfully`));
            }));
        }
        // if not, then throw error.
        return (Promise.reject(new UsageError(`'${this._dirname}' module doesn't exists under '/csunit/tests/' directory. Nothing to remove.`)));
    }
    createFiles(filenames) {
        const promises = filenames.map((filename) => {
            if (validateTestFile(filename)) {
                const modifiedName = getTestFileName(filename);
                const dest = this.genTestFilePath(modifiedName);
                if (!existsSync(dest)) {
                    return this.testScript(modifiedName);
                }
                return (Promise.resolve(`${modifiedName} already exists inside ${this._destination}, command will not create the file.`));
            }
            return (Promise.resolve(`${filename} - Invalid test filename, unable to add.`));
        });
        return Promise.all(promises);
    }
    removeFiles(filenames) {
        const promises = filenames.map((filename) => {
            if (validateTestFile(filename)) {
                const modifiedName = getTestFileName(filename);
                const dest = this.genTestFilePath(modifiedName);
                if (existsSync(dest)) {
                    return (fsp.unlink(dest)
                        .then(() => Promise.resolve(`${modifiedName}.test.js - file removed successfully`)));
                }
                return (Promise.resolve(`${modifiedName} doesn't exists inside ${this._destination}, command unable to remove file.`));
            }
            return (Promise.resolve(`${filename} - Invalid test filename, unable to remove.`));
        });
        return Promise.all(promises);
    }
    genTestFilePath(name) {
        let testFilePath = "";
        if ((name && name.length > 0) && (this._destination && this._destination.length > 0)) {
            testFilePath = path.join(this._destination, `${name}.test.js`);
        }
        return (testFilePath);
    }
    destination() {
        if (this._destination) {
            // check permission of the destination folder
            const destParent = path.dirname(this._destination);
            if (existsSync(destParent)) {
                if (!existsSync(this._destination)) {
                    mkdirSync(this._destination);
                    return (Promise.resolve(true));
                }
                return (Promise.reject(new UsageError(`Unable to create '${this._destination}' folder, it's already exists.
Please delete the folder before proceed or change -d <dirname>.`)));
            }
            return (Promise.reject(new UsageError(`'${destParent}' directory does not exists, please create it.`)));
        }
        return (Promise.reject(new TypeError("Invalid 'this._destination' in TestFileSystem::destination()")));
    }
    layout() {
        const dirname = this._dirname;
        function middleware(data) {
            // update <title> of html file.
            const content = Utils.format(data, "title", Utils.capitalizeFirstLetter(dirname));
            return content;
        }
        return this._create("layout.tmpl", "index.html", middleware);
    }
    script() {
        const dirname = this._dirname;
        function middleware(data) {
            // update information.
            let content = Utils.format(data, "label", Utils.capitalizeFirstLetter(dirname));
            content = Utils.format(content, "module", dirname);
            return content;
        }
        return this._create("script.tmpl", "index.js", middleware);
    }
    testScript(filename) {
        function middleware(data) {
            // update information.
            let content = Utils.format(data, "label", Utils.capitalizeFirstLetter(filename));
            content = Utils.format(content, "module", filename);
            return content;
        }
        return this._create("test.tmpl", `${filename}.test.js`, middleware);
    }
    async updateTestModules(callback) {
        if ((this._dirname) && (this._destination)) {
            // get /csunit/tests/home/index.js from this._destination
            const home = path.join(this._cli, "../../tests/home/index.js"); // path.dirname(this._destination);
            // home = path.join(home, 'home/index.js');
            // read data from /csunit/tests/home/index.js
            let content = await fsp.readFile(home, "utf-8");
            // modify content by adding new test module.
            content = callback.apply(this, [content]);
            // write new test module name in 'testModules' array.
            return fsp.writeFile(home, content)
                .then(() => Promise.resolve("Updated test module array in the file '/csunit/tests/home/index.js'."));
        }
        return Promise.reject(new TypeError("Invalid input"));
    }
    addModule(content) {
        let updated = "";
        if (content) {
            // search
            const search = "const testModules = [";
            const append = `\n\t'${this._dirname}',`;
            const inx = content.indexOf(search);
            const before = content.substring(0, inx + search.length);
            const after = content.substring(inx + search.length);
            // replace
            updated = before + append + after;
        }
        return (updated);
    }
    removeModule(content) {
        let updated = "";
        if (content) {
            // search
            const search = `\n\t'${this._dirname}',`;
            const inx = content.indexOf(search);
            if (inx > 0) {
                updated = content.replace(search, "");
            }
            else {
                updated = content;
            }
        }
        return (updated);
    }
    // private methods
    _create(source, destination, middleware) {
        if (this._destination) {
            const dest = path.join(this._destination, destination);
            if (!existsSync(dest)) {
                // read from source file
                const sourceFile = path.join(this._templates, source);
                // use promise method
                return fsp.readFile(sourceFile, "utf-8").then((data) => {
                    // do manipulation with data
                    const content = middleware ? middleware(data) : data;
                    // write in destination
                    return fsp.writeFile(dest, content)
                        .then(( /* data */) => Promise.resolve(`${destination} - file created successfully.`));
                });
            }
            return Promise.reject(new UsageError(`'${dest}' exists.\nPlease use another filename.`));
        }
        return Promise.reject(new TypeError("Destination directory in invalid or not present."));
    }
}
const OStream = {
    createTestDir(dirname) {
        if (dirname && dirname.length > 0) {
            const tfs = new TestFileSystem(dirname);
            return (tfs.createDir());
        }
        return (Promise.reject(new TypeError("Invalid input <dirname> in OStream::createTestDir()")));
    },
    createTestFiles(dirname, filenames) {
        if (dirname && dirname.length > 0) {
            if (filenames && filenames.length > 0) {
                const tfs = new TestFileSystem(dirname);
                if (tfs.exists()) {
                    return (tfs.createFiles(filenames));
                }
                return (Promise.reject(new UsageError(`'${dirname}' test folder doesn't exists. Please add test folder before adding test script.`)));
            }
            return (Promise.reject(new TypeError("Invalid input <filenames> in OStream::createTestFiles()")));
        }
        return (Promise.reject(new TypeError("Invalid input <dirname> in OStream::createTestFiles()")));
    },
    removeTestDir(dirname) {
        if (dirname && dirname.length > 0) {
            const tfs = new TestFileSystem(dirname);
            return (tfs.removeDir());
        }
        return (Promise.reject(new TypeError("Invalid input <dirname> in OStream::removeTestDir()")));
    },
    removeTestFiles(dirname, filenames) {
        if (dirname && dirname.length > 0) {
            if (filenames && filenames.length > 0) {
                const tfs = new TestFileSystem(dirname);
                if (tfs.exists()) {
                    return (tfs.removeFiles(filenames));
                }
                return (Promise.reject(new TypeError(`'${dirname}' test folder doesn't exists. Please add test folder before adding test script.`)));
            }
            return (Promise.reject(new TypeError("Invalid input <filenames> in OStream::removeTestFiles()")));
        }
        return (Promise.reject(new TypeError("Invalid input <dirname> in OStream::removeTestFiles()")));
    }
};
export { OStream };
//# sourceMappingURL=stream.js.map