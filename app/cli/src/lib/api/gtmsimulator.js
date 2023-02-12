"use strict";
import path from "path";
import * as fs from "fs";
import * as fsp from "fs/promises";
import os from "os";
// import { ReadFileMiddleware, ReadLineMiddleware, Stream } from "../utils/istream.js";
import { GTMStream } from "./gtmstream.js";
import { Utils } from "../utils/utility.js";
import { UsageError } from "../core/errors.js";
const GTMRELATEDFILES = [
    ".gtconfig",
    ".gtconfig.json",
    ".gtprj",
    ".gt_open_prj_flt",
    ".gt_proj_flt",
    ".gtdeftags",
    ".gtdeftgts",
    ".gtlntfilt",
    ".gtm_cshrc",
    ".gtprj_types",
];
function padTo2Digits(num) {
    return num.toString().padStart(2, "0");
}
function displayDuration(start, end) {
    const duration = end.getTime() - start.getTime();
    const hms = Utils.formatToHMS(duration);
    const sHr = `${padTo2Digits(hms.hr)}`;
    const sMin = `${padTo2Digits(hms.min)}`;
    const sSec = `${padTo2Digits(hms.sec)}`;
    const sMS = `${padTo2Digits(hms.msec)}`;
    const hmsStr = `Duration(H:M:S::MS): ${sHr}:${sMin}:${sSec}::${sMS}`;
    Utils.display(hmsStr);
}
export class GTMSimulator {
    constructor() {
        this.mGTMInfos = [];
        this.mGTMFile = "uigtm.json";
        this.mProjectsPath = "";
        this.mLocalLibsPath = "";
        this.mHomeReadPath = "";
        this.mHomeWritePath = "";
        this.mCopyFrom = "";
        this.mCopyTo = "";
        this.mCopyErrors = [];
        this.init();
    }
    async setup(input) {
        // TODO: validate input's access.
        if (process.env.HOME === undefined || process.env.HOME.length <= 0) {
            throw new UsageError("local HOME environment variable is not set.");
        }
        // TODO: replace '\\' with path.separator()
        const remoteHomeDir = `\\\\${input.hostname}\\${input.homeDir}`;
        if (!Utils.FilesystemStream.writable(remoteHomeDir)) {
            throw new UsageError(`${remoteHomeDir} doesn't have write permission.`);
        }
        this.mHomeReadPath = process.env.HOME;
        this.mHomeWritePath = remoteHomeDir;
        this.mProjectsPath = input.gtmInput.projectPath;
        this.mLocalLibsPath = input.gtmInput.localLibsPath;
        const start = new Date();
        // read from local home directory
        await this.readFromHome();
        Utils.display("");
        // copy projects
        this.mCopyFrom = `\\\\${os.hostname()}\\projects`;
        this.mCopyTo = `\\\\${input.hostname}\\projects`;
        const options = {
            copyX86e: input.gtmInput.copyX86e,
            copyRun: input.gtmInput.copyRun,
            copyTestrun: input.gtmInput.copyTestrun,
            copyData: input.gtmInput.copyData,
        };
        await this.copyProjects(options);
        Utils.display("");
        // write to remote home directory
        await this.writeToHome();
        Utils.display("");
        // display duration
        const end = new Date();
        displayDuration(start, end);
        Utils.display("");
        return Promise.resolve(`Setup UIGTM is Completed on "${input.hostname}"!`);
    }
    async export(input) {
        if (process.env.HOME === undefined || process.env.HOME.length <= 0) {
            throw new UsageError("local HOME environment variable is not set.");
        }
        const start = new Date();
        // read from local home directory
        this.mHomeReadPath = process.env.HOME;
        await this.readFromHome();
        Utils.display("");
        // export
        const exportObj = {};
        // accumulating data.
        exportObj.hostname = os.hostname();
        this.mGTMInfos.forEach((elem) => {
            // remove . from filename.
            // const filename = elem.filename.slice(1); //elem.filename.split(".")[1];
            exportObj[elem.filename] = elem.content;
        });
        // write to file
        const obj = {
            file: (input.exportInWorkingDir) ? this.mGTMFile : path.join(input.destination, this.mGTMFile),
            middleware: (writer) => {
                // this.content.data
                const content = JSON.stringify(exportObj, null, "\t");
                writer.write(content);
            },
        };
        await GTMStream.write(obj);
        Utils.display("");
        // display duration
        const end = new Date();
        displayDuration(start, end);
        Utils.display("");
        Utils.display("Exported successful !!!");
        return Promise.resolve();
    }
    async import(input) {
        // TODO: validate input's access.
        if (process.env.HOME === undefined || process.env.HOME.length <= 0) {
            throw new UsageError("local HOME environment variable is not set.");
        }
        const start = new Date();
        this.mHomeReadPath = process.env.HOME;
        this.mHomeWritePath = process.env.HOME;
        this.mProjectsPath = input.gtmInput.projectPath; // read it from uigtm if exists
        this.mLocalLibsPath = input.gtmInput.localLibsPath; // read it from uigtm if exists
        // read from local home directory
        await this.readImportFile(input.source);
        // Utils.display(this.mGTMInfos);
        // copy projects
        this.mCopyTo = `\\\\${os.hostname()}\\projects`;
        const options = {
            copyX86e: input.gtmInput.copyX86e,
            copyRun: input.gtmInput.copyRun,
            copyTestrun: input.gtmInput.copyTestrun,
            copyData: input.gtmInput.copyData,
        };
        Utils.display("");
        await this.copyProjects(options);
        // write to remote home directory
        Utils.display("");
        await this.writeToHome();
        // display duration
        Utils.display("");
        const end = new Date();
        displayDuration(start, end);
        Utils.display("");
        Utils.display("Import completed ...");
        return (Promise.resolve());
    }
    init() {
        GTMRELATEDFILES.forEach((file) => this.mGTMInfos.push({ filename: file, content: {} }));
    }
    find(filename) {
        return this.mGTMInfos.find((elem) => elem.filename === filename);
    }
    insert(data) {
        const item = this.find(data.filename);
        if (item) {
            item.content = data.content;
        }
        else {
            this.mGTMInfos.push(data);
        }
    }
    resolveReadHome(filename) {
        if (this.mHomeReadPath) {
            const resolvedPath = filename.length > 0 ? path.resolve(this.mHomeReadPath, filename) : "";
            return resolvedPath;
        }
        throw new UsageError("Local 'HOME' environment variable is missing!");
    }
    resolveWriteHome(filename) {
        if (this.mHomeWritePath) {
            const resolvedPath = filename.length > 0 ? path.resolve(this.mHomeWritePath, filename) : "";
            return resolvedPath;
        }
        throw new UsageError("Remote 'HOME' environment variable is missing!");
    }
    readFromHome() {
        Utils.display("Reading from local HOME directory ...");
        const promises = [
            this.readConfigFile(),
            this.readConfigJsonFile(),
            this.readProjectFile(),
            this.readOpenPrjFlt(),
            this.readPrjFlt(),
            this.readDefTags(),
            this.readDeftgts(),
            this.readLntfilt(),
            this.readCshrc(),
            this.readPrjTypes(),
        ];
        return Promise.all(promises).then(() => Promise.resolve());
    }
    readConfigFile() {
        const filename = ".gtconfig";
        // const projectsPath = this.mProjectsPath;
        // const localLibsPath = this.mLocalLibsPath;
        const middleware = {
            content: {},
            type: "line",
            method(content, lineno) {
                // Utils.display(`Line ${lineno} : ${content}`);
                switch (lineno) {
                    case 1:
                        this.content.win_pref = content;
                        break;
                    case 2:
                        this.content.editor_theme = content;
                        break;
                    case 3:
                        this.content.projects = content;
                        break;
                    case 5:
                        this.content.local_libs = content;
                        break;
                    case 6:
                        this.content.ref_sys = content;
                        break;
                    case 8:
                        this.content.user_initial = content;
                        break;
                    case 9:
                        this.content.user_full_name = content;
                        break;
                    case 10:
                        this.content.project_path = content;
                        break;
                    case 12:
                        this.content.file_diff = content;
                        break;
                    case 15:
                        this.content.zero = content;
                        break;
                    default:
                    // do nothing
                }
            },
        };
        const post = () => {
            this.insert({ filename, content: middleware.content });
        };
        const rdObj = {
            file: this.resolveReadHome(filename),
            middleware,
            post,
        };
        return GTMStream.read(rdObj);
    }
    readConfigJsonFile() {
        const filename = ".gtconfig.json";
        const middleware = {
            content: {},
            type: "file",
            method(content) {
                // Utils.display(lineno);
                this.content = JSON.parse(content);
            },
        };
        const post = () => {
            this.insert({ filename, content: middleware.content });
        };
        const rdObj = {
            file: this.resolveReadHome(filename),
            middleware,
            post,
        };
        return GTMStream.read(rdObj);
    }
    readProjectFile() {
        const filename = ".gtprj";
        const baseProjectsPath = this.mProjectsPath.split("\\")[0];
        const projectsPath = this.mProjectsPath;
        const middleware = {
            content: {
                projects: [],
            },
            type: "line",
            method(content, lineno) {
                // Utils.display(lineno);
                if (lineno === 1) {
                    this.content.projects.push(path.join(baseProjectsPath, "\\"));
                }
                else if (content[0] === "/" && content[1] === "/") {
                    this.content.projects.push(content);
                }
                else {
                    // replace current project path with this.this.mProjectsPath
                    const project = content.substring(content.lastIndexOf("/") + 1);
                    const projectPath = path.join(projectsPath, project);
                    this.content.projects.push(projectPath);
                }
            },
        };
        const post = () => {
            this.insert({ filename, content: middleware.content });
        };
        const rdObj = {
            file: this.resolveReadHome(filename),
            middleware,
            post,
        };
        return GTMStream.read(rdObj);
    }
    readPrjFlt() {
        const filename = ".gt_proj_flt";
        const middleware = {
            content: {},
            type: "file",
            method(content) {
                // Utils.display(lineno);
                this.content.data = content;
            },
        };
        const post = () => {
            this.insert({ filename, content: middleware.content });
        };
        const rdObj = {
            file: this.resolveReadHome(filename),
            middleware,
            post,
        };
        return GTMStream.read(rdObj);
    }
    readOpenPrjFlt() {
        const filename = ".gt_open_prj_flt";
        const middleware = {
            content: {},
            type: "file",
            method(content) {
                // Utils.display(lineno);
                this.content.data = content;
            },
        };
        const post = () => {
            this.insert({ filename, content: middleware.content });
        };
        const rdObj = {
            file: this.resolveReadHome(filename),
            middleware,
            post,
        };
        return GTMStream.read(rdObj);
    }
    readDefTags() {
        const filename = ".gtdeftags";
        const middleware = {
            content: {},
            type: "file",
            method(content) {
                // Utils.display(lineno);
                this.content.data = content;
            },
        };
        const post = () => {
            this.insert({ filename, content: middleware.content });
        };
        const rdObj = {
            file: this.resolveReadHome(filename),
            middleware,
            post,
        };
        return GTMStream.read(rdObj);
    }
    readDeftgts() {
        const filename = ".gtdeftgts";
        const middleware = {
            content: {},
            type: "file",
            method(content) {
                // Utils.display(lineno);
                this.content.data = content;
            },
        };
        const post = () => {
            this.insert({ filename, content: middleware.content });
        };
        const rdObj = {
            file: this.resolveReadHome(filename),
            middleware,
            post,
        };
        return GTMStream.read(rdObj);
    }
    readLntfilt() {
        const filename = ".gtlntfilt";
        const middleware = {
            content: {},
            type: "file",
            method(content) {
                // Utils.display(lineno);
                this.content.data = content;
            },
        };
        const post = () => {
            this.insert({ filename, content: middleware.content });
        };
        const rdObj = {
            file: this.resolveReadHome(filename),
            middleware,
            post,
        };
        return GTMStream.read(rdObj);
    }
    readCshrc() {
        const filename = ".gtm_cshrc";
        const middleware = {
            content: {},
            type: "file",
            method(content) {
                // Utils.display(content);
                this.content.data = content;
            },
        };
        const post = () => {
            this.insert({ filename, content: middleware.content });
            // Utils.display(this.find(filename)?.content.data);
        };
        const rdObj = {
            file: this.resolveReadHome(filename),
            middleware,
            post,
        };
        return GTMStream.read(rdObj);
    }
    readPrjTypes() {
        const filename = ".gtprj_types";
        const middleware = {
            content: {},
            type: "file",
            method(content) {
                this.content.data = content;
            },
        };
        const post = () => {
            this.insert({ filename, content: middleware.content });
        };
        const rdObj = {
            file: this.resolveReadHome(filename),
            middleware,
            post,
        };
        return GTMStream.read(rdObj);
    }
    validateImportObj(obj) {
        // validate "hostname"
        if (typeof obj.hostname === "undefined") {
            throw new UsageError("Invalid import file. 'hostname' variable is missing");
        }
        // validate ".gtconfig"
        if (typeof obj[".gtconfig"] !== "undefined") {
            if (typeof obj[".gtconfig"].win_pref === "undefined") {
                throw new UsageError("Invalid import file. '.gtconfig > win_pref' variable is missing");
            }
            if (typeof obj[".gtconfig"].editor_theme === "undefined") {
                throw new UsageError("Invalid import file. '.gtconfig > editor_theme' variable is missing");
            }
            if (typeof obj[".gtconfig"].projects === "undefined") {
                throw new UsageError("Invalid import file. '.gtconfig > projects' variable is missing");
            }
            if (typeof obj[".gtconfig"].local_libs === "undefined") {
                throw new UsageError("Invalid import file. '.gtconfig > local_libs' variable is missing");
            }
            if (typeof obj[".gtconfig"].ref_sys === "undefined") {
                throw new UsageError("Invalid import file. '.gtconfig > ref_sys' variable is missing");
            }
            if (typeof obj[".gtconfig"].user_initial === "undefined") {
                throw new UsageError("Invalid import file. '.gtconfig > user_initial' variable is missing");
            }
            if (typeof obj[".gtconfig"].user_full_name === "undefined") {
                throw new UsageError("Invalid import file. '.gtconfig > user_full_name' variable is missing");
            }
            if (typeof obj[".gtconfig"].project_path === "undefined") {
                throw new UsageError("Invalid import file. '.gtconfig > project_path' variable is missing");
            }
            if (typeof obj[".gtconfig"].file_diff === "undefined") {
                throw new UsageError("Invalid import file. '.gtconfig > file_diff' variable is missing");
            }
            if (typeof obj[".gtconfig"].zero === "undefined") {
                throw new UsageError("Invalid import file. '.gtconfig > zero' variable is missing");
            }
        }
        else {
            throw new UsageError("Invalid import file. '.gtconfig' variable is missing");
        }
        // validate ".gtconfig.json"
        if (typeof obj[".gtconfig.json"] !== "undefined") {
            if (typeof obj[".gtconfig.json"].local_libraries === "undefined") {
                throw new UsageError("Invalid import file. '.gtconfig.json > local_libraries' variable is missing");
            }
            if (typeof obj[".gtconfig.json"].bg_comm_check === "undefined") {
                throw new UsageError("Invalid import file. '.gtconfig.json > bg_comm_check' variable is missing");
            }
            if (typeof obj[".gtconfig.json"].ign_work_files === "undefined") {
                throw new UsageError("Invalid import file. '.gtconfig.json > ign_work_files' variable is missing");
            }
            if (typeof obj[".gtconfig.json"].recent_ref_sys === "undefined") {
                throw new UsageError("Invalid import file. '.gtconfig.json > recent_ref_sys' variable is missing");
            }
        }
        else {
            throw new UsageError("Invalid import file. '.gtconfig.json' variable is missing");
        }
        // validate ".gtprj"
        if (typeof obj[".gtprj"] !== "undefined") {
            if (typeof obj[".gtprj"].projects === "undefined") {
                throw new UsageError("Invalid import file. '.gtprj > projects' variable is missing");
            }
        }
        else {
            throw new UsageError("Invalid import file. '.gtprj' variable is missing");
        }
        // validate ".gt_open_prj_flt"
        if (typeof obj[".gt_open_prj_flt"] !== "undefined") {
            if (typeof obj[".gt_open_prj_flt"].data === "undefined") {
                throw new UsageError("Invalid import file. '.gt_open_prj_flt > data' variable is missing");
            }
        }
        else {
            throw new UsageError("Invalid import file. '.gt_open_prj_flt' variable is missing");
        }
        // validate ".gt_proj_flt"
        if (typeof obj[".gt_proj_flt"] !== "undefined") {
            if (typeof obj[".gt_proj_flt"].data === "undefined") {
                throw new UsageError("Invalid import file. '.gt_proj_flt > data' variable is missing");
            }
        }
        else {
            throw new UsageError("Invalid import file. '.gt_proj_flt' variable is missing");
        }
        // validate ".gtdeftags"
        if (typeof obj[".gtdeftags"] !== "undefined") {
            if (typeof obj[".gtdeftags"].data === "undefined") {
                throw new UsageError("Invalid import file. '.gtdeftags > data' variable is missing");
            }
        }
        else {
            throw new UsageError("Invalid import file. '.gtdeftags' variable is missing");
        }
        // validate ".gtdeftgts"
        if (typeof obj[".gtdeftgts"] !== "undefined") {
            if (typeof obj[".gtdeftgts"].data === "undefined") {
                throw new UsageError("Invalid import file. '.gtdeftgts > data' variable is missing");
            }
        }
        else {
            throw new UsageError("Invalid import file. '.gtdeftgts' variable is missing");
        }
        // validate ".gtlntfilt"
        if (typeof obj[".gtlntfilt"] !== "undefined") {
            if (typeof obj[".gtlntfilt"].data === "undefined") {
                throw new UsageError("Invalid import file. '.gtlntfilt > data' variable is missing");
            }
        }
        else {
            throw new UsageError("Invalid import file. '.gtlntfilt' variable is missing");
        }
        // validate ".gtm_cshrc"
        if (typeof obj[".gtm_cshrc"] !== "undefined") {
            if (typeof obj[".gtm_cshrc"].data === "undefined") {
                throw new UsageError("Invalid import file. '.gtm_cshrc > data' variable is missing");
            }
        }
        else {
            throw new UsageError("Invalid import file. '.gtm_cshrc' variable is missing");
        }
        // validate ".gtprj_types"
        if (typeof obj[".gtprj_types"] !== "undefined") {
            if (typeof obj[".gtprj_types"].data === "undefined") {
                throw new UsageError("Invalid import file. '.gtprj_types > data' variable is missing");
            }
        }
        else {
            throw new UsageError("Invalid import file. '.gtprj_types' variable is missing");
        }
        return (true);
    }
    readImportFile(filename) {
        Utils.display(`Reading ${filename} ...`);
        const middleware = (content) => {
            const jsonObj = JSON.parse(content);
            // validate import object
            if (this.validateImportObj(jsonObj)) {
                Object.keys(jsonObj).forEach((key) => {
                    if (key === "hostname") {
                        // get remote host name
                        this.mCopyFrom = `\\\\${jsonObj.hostname}\\projects`;
                    }
                    else {
                        this.insert({ filename: key, content: jsonObj[key] });
                    }
                });
            }
        };
        return GTMStream.readFile(filename, middleware);
    }
    copyProjects(options) {
        if (this.mCopyFrom.length <= 0) {
            throw new TypeError("Source path of projects to copy is missing");
        }
        if (this.mCopyTo.length <= 0) {
            throw new TypeError("Destination path of projects to paste is missing");
        }
        // copy projects
        const projects = this.find(".gtconfig")?.content?.projects.split(" ");
        return (this.copy(this.mCopyFrom, this.mCopyTo, projects, options));
    }
    async copy(source, destination, projects, options) {
        // validate inputs
        if (source.length > 0 && destination.length > 0 && projects.length > 0) {
            // check read/write permission of source & destination
            if (!Utils.FilesystemStream.readable(source)) {
                throw new UsageError(`${source} doesn't have read permission.`);
            }
            if (!Utils.FilesystemStream.writable(destination)) {
                throw new UsageError(`${destination} doesn't have write permission.`);
            }
            // copy projects
            Utils.display("Copying projects ...");
            const promises = projects.map((project) => {
                if (project.length > 0) {
                    const src = path.join(source, project);
                    if (fs.existsSync(src)) {
                        const dest = path.join(destination, project);
                        return this.copyProject(src, dest, options).then(() => {
                            Utils.display(`   Copied: ${dest}`);
                            Promise.resolve();
                        });
                    }
                }
                return Promise.resolve();
            });
            await Promise.all(promises);
            // write copy error to copy.err
            this.writeCopyError();
            return Promise.resolve();
        }
        throw new TypeError("Invalid input to 'GTMSimulator::copy()' method.");
    }
    async copyProject(project, destination, options) {
        // TODO: filter method should be part of parameter (???)
        // filter method
        const filter = (file) => {
            // ignore x86e_win64 folder
            if (file.includes("x86e_win64") && !options.copyX86e)
                return false;
            return true;
        };
        const items = await fsp.readdir(project, { withFileTypes: true });
        return Promise.all(items.map((item) => {
            const src = path.join(project, item.name);
            const dest = path.join(destination, item.name);
            // if no need to copy 'testrun', 'run', 'data', then make empty directory with corresponding directory name.
            if ((item.name === "run" && !options.copyRun) ||
                (item.name === "testrun" && !options.copyTestrun) ||
                (item.name === "data" && !options.copyData)) {
                return fsp.mkdir(dest, { recursive: true }).catch((err) => {
                    this.mCopyErrors.push(err);
                    Promise.resolve();
                });
            }
            // else copy entire directory.
            return fsp
                .cp(src, dest, { filter, force: true, recursive: true })
                .then(() => Promise.resolve())
                .catch((err) => {
                // TODO: write copy error here (???)
                this.mCopyErrors.push(err);
                Promise.resolve();
            });
        })).then(() => Promise.resolve());
    }
    writeCopyError() {
        const middleware = (writer) => {
            // write to file
            this.mCopyErrors.forEach((err) => {
                // convert error to string
                writer.write(`${err.toString()}\n`);
            });
        };
        const obj = {
            file: "copy.err",
            middleware,
        };
        return GTMStream.write(obj);
    }
    writeToHome() {
        Utils.display("Writing to remote HOME directory ...");
        const promises = [
            this.writeConfigFile(),
            this.writeConfigJsonFile(),
            this.writeProjectFile(),
            this.writeOpenPrjFlt(),
            this.writePrjFlt(),
            this.writeDefTags(),
            this.writeDeftgts(),
            this.writeLntfilt(),
            this.writeCshrc(),
            this.writePrjTypes(),
        ];
        return Promise.all(promises).then(() => Promise.resolve());
    }
    writeConfigFile() {
        const filename = ".gtconfig";
        const projectsPath = this.mProjectsPath;
        const localLibsPath = this.mLocalLibsPath;
        const obj = {
            file: this.resolveWriteHome(filename),
            middleware: (writer) => {
                const content = this.find(filename)?.content;
                // write to file
                writer.write(`${content.win_pref}\n`);
                writer.write(`${content.editor_theme}\n`);
                writer.write(`${content.projects}\n`);
                writer.write("\n");
                writer.write(`${projectsPath}\n`); // content.local_libs
                writer.write(`${content.ref_sys}\n`);
                writer.write("\n");
                writer.write(`${content.user_initial}\n`);
                writer.write(`${content.user_full_name}\n`);
                writer.write(`${localLibsPath}\n`); // content.project_path
                writer.write("\n");
                writer.write(`${content.file_diff}\n`);
                writer.write("\n");
                writer.write("\n");
                writer.write(`${content.zero}\n`);
            },
        };
        return GTMStream.write(obj);
    }
    writeConfigJsonFile() {
        const filename = ".gtconfig.json";
        const obj = {
            file: this.resolveWriteHome(filename),
            middleware: (writer) => {
                const content = JSON.stringify(this.find(filename)?.content, null, "\t");
                // write to file
                writer.write(`${content}`);
            },
        };
        return GTMStream.write(obj);
    }
    writeProjectFile() {
        const filename = ".gtprj";
        const obj = {
            file: this.resolveWriteHome(filename),
            middleware: (writer) => {
                const projects = this.find(filename)?.content.projects;
                // write to file
                projects.forEach((project) => {
                    writer.write(`${project}\n`);
                });
            },
        };
        return GTMStream.write(obj);
    }
    writeOpenPrjFlt() {
        const filename = ".gt_open_prj_flt";
        const obj = {
            file: this.resolveWriteHome(filename),
            middleware: (writer) => {
                writer.write("");
            },
        };
        return GTMStream.write(obj);
    }
    writePrjFlt() {
        const filename = ".gt_proj_flt";
        const obj = {
            file: this.resolveWriteHome(filename),
            middleware: (writer) => {
                writer.write("");
            },
        };
        return GTMStream.write(obj);
    }
    writeDefTags() {
        const filename = ".gtdeftags";
        const obj = {
            file: this.resolveWriteHome(filename),
            middleware: (writer) => {
                writer.write("");
            },
        };
        return GTMStream.write(obj);
    }
    writeDeftgts() {
        const filename = ".gtdeftgts";
        const obj = {
            file: this.resolveWriteHome(filename),
            middleware: (writer) => {
                writer.write("");
            },
        };
        return GTMStream.write(obj);
    }
    writeLntfilt() {
        const filename = ".gtlntfilt";
        const obj = {
            file: this.resolveWriteHome(filename),
            middleware: (writer) => {
                writer.write("");
            },
        };
        return GTMStream.write(obj);
    }
    writeCshrc() {
        const filename = ".gtm_cshrc";
        const obj = {
            file: this.resolveWriteHome(filename),
            middleware: (writer) => {
                // this.content.data
                const data = this.find(filename)?.content.data;
                writer.write(data);
            },
        };
        return GTMStream.write(obj);
    }
    writePrjTypes() {
        const filename = ".gtprj_types";
        const obj = {
            file: this.resolveWriteHome(filename),
            middleware: (writer) => {
                // this.content.data
                const data = this.find(filename)?.content.data;
                writer.write(data);
            },
        };
        return GTMStream.write(obj);
    }
}
//# sourceMappingURL=gtmsimulator.js.map