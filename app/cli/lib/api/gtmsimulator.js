"use strict";
import path from "path";
import * as fs from "fs";
import * as fsp from "fs/promises";
import os from "os";
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
    ".gtprj_types"
];
export class GTMSimulator {
    constructor() {
        this.mGTMInfos = [];
        // this.mHome = process.env.HOME || "";
        this.mProjectsPath = "";
        this.mLocalLibsPath = "";
        this.mHomeReadPath = "";
        this.mHomeWritePath = "";
        this.mCopyErrors = [];
        this.init();
    }
    async setup(input) {
        // TODO: validate input's access.
        if (process.env.HOME === undefined || process.env.HOME.length <= 0) {
            throw new UsageError("local HOME environment variable is not set.");
        }
        if (!Utils.FilesystemStream.writable(`\\\\${input.hostname}\\HOME`)) {
            throw new UsageError(`${`\\\\${input.hostname}\\HOME`} doesn't have write permission.`);
        }
        this.mHomeReadPath = process.env.HOME;
        this.mHomeWritePath = `\\\\${input.hostname}\\HOME`;
        this.mProjectsPath = input.projectPath;
        this.mLocalLibsPath = input.localLibsPath;
        // read from local home directory
        await this.readFromHome();
        Utils.display("\n");
        // copy projects
        const localProjectsPath = `\\\\${os.hostname()}\\projects`;
        const remoteProjectsPath = `\\\\${input.hostname}\\projects`;
        const projects = this.find(".gtconfig")?.content?.projects.split(" ");
        await this.copy(localProjectsPath, remoteProjectsPath, projects, { copyX86e: input.copyX86e });
        Utils.display("");
        // write to remote home directory
        await this.writeToHome();
        Utils.display("");
        return (Promise.resolve(`Setup UIGTM is Completed on ${input.hostname}!`));
    }
    // export(input: ExportInput) {
    // }
    // import(input: ImportInput) {
    // }
    init() {
        GTMRELATEDFILES.forEach((file) => this.mGTMInfos.push({ filename: file, content: {} }));
    }
    find(filename) {
        return (this.mGTMInfos.find((elem) => (elem.filename === filename)));
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
            const resolvedPath = (filename.length > 0) ? path.resolve(this.mHomeReadPath, filename) : "";
            return (resolvedPath);
        }
        throw new UsageError("Local 'HOME' environment variable is missing!");
    }
    resolveWriteHome(filename) {
        if (this.mHomeWritePath) {
            const resolvedPath = (filename.length > 0) ? path.resolve(this.mHomeWritePath, filename) : "";
            return (resolvedPath);
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
            this.readPrjTypes()
        ];
        return (Promise.all(promises).then(() => Promise.resolve()));
    }
    readConfigFile() {
        const filename = ".gtconfig";
        const projectsPath = this.mProjectsPath;
        const localLibsPath = this.mLocalLibsPath;
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
                        this.content.local_libs = localLibsPath;
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
                        this.content.project_path = projectsPath;
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
            }
        };
        const post = () => {
            this.insert({ filename, content: middleware.content });
        };
        const rdObj = {
            file: this.resolveReadHome(filename),
            middleware,
            post
        };
        return (GTMStream.read(rdObj));
    }
    readConfigJsonFile() {
        const filename = ".gtconfig.json";
        const middleware = {
            content: {},
            type: "file",
            method(content) {
                // Utils.display(lineno);
                this.content = JSON.parse(content);
            }
        };
        const post = () => {
            this.insert({ filename, content: middleware.content });
        };
        const rdObj = {
            file: this.resolveReadHome(filename),
            middleware,
            post
        };
        return (GTMStream.read(rdObj));
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
            }
        };
        const post = () => {
            this.insert({ filename, content: middleware.content });
        };
        const rdObj = {
            file: this.resolveReadHome(filename),
            middleware,
            post
        };
        return (GTMStream.read(rdObj));
    }
    readPrjFlt() {
        const filename = ".gt_proj_flt";
        const middleware = {
            content: {},
            type: "file",
            method(content) {
                // Utils.display(lineno);
                this.content.data = content;
            }
        };
        const post = () => {
            this.insert({ filename, content: middleware.content });
        };
        const rdObj = {
            file: this.resolveReadHome(filename),
            middleware,
            post
        };
        return (GTMStream.read(rdObj));
    }
    readOpenPrjFlt() {
        const filename = ".gt_open_prj_flt";
        const middleware = {
            content: {},
            type: "file",
            method(content) {
                // Utils.display(lineno);
                this.content.data = content;
            }
        };
        const post = () => {
            this.insert({ filename, content: middleware.content });
        };
        const rdObj = {
            file: this.resolveReadHome(filename),
            middleware,
            post
        };
        return (GTMStream.read(rdObj));
    }
    readDefTags() {
        const filename = ".gtdeftags";
        const middleware = {
            content: {},
            type: "file",
            method(content) {
                // Utils.display(lineno);
                this.content.data = content;
            }
        };
        const post = () => {
            this.insert({ filename, content: middleware.content });
        };
        const rdObj = {
            file: this.resolveReadHome(filename),
            middleware,
            post
        };
        return (GTMStream.read(rdObj));
    }
    readDeftgts() {
        const filename = ".gtdeftgts";
        const middleware = {
            content: {},
            type: "file",
            method(content) {
                // Utils.display(lineno);
                this.content.data = content;
            }
        };
        const post = () => {
            this.insert({ filename, content: middleware.content });
        };
        const rdObj = {
            file: this.resolveReadHome(filename),
            middleware,
            post
        };
        return (GTMStream.read(rdObj));
    }
    readLntfilt() {
        const filename = ".gtlntfilt";
        const middleware = {
            content: {},
            type: "file",
            method(content) {
                // Utils.display(lineno);
                this.content.data = content;
            }
        };
        const post = () => {
            this.insert({ filename, content: middleware.content });
        };
        const rdObj = {
            file: this.resolveReadHome(filename),
            middleware,
            post
        };
        return (GTMStream.read(rdObj));
    }
    readCshrc() {
        const filename = ".gtm_cshrc";
        const middleware = {
            content: {},
            type: "file",
            method(content) {
                // Utils.display(content);
                this.content.data = content;
            }
        };
        const post = () => {
            this.insert({ filename, content: middleware.content });
            // Utils.display(this.find(filename)?.content.data);
        };
        const rdObj = {
            file: this.resolveReadHome(filename),
            middleware,
            post
        };
        return (GTMStream.read(rdObj));
    }
    readPrjTypes() {
        const filename = ".gtprj_types";
        const middleware = {
            content: {},
            type: "file",
            method(content) {
                this.content.data = content;
            }
        };
        const post = () => {
            this.insert({ filename, content: middleware.content });
        };
        const rdObj = {
            file: this.resolveReadHome(filename),
            middleware,
            post
        };
        return (GTMStream.read(rdObj));
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
                        return (this.copyProject(src, dest, options.copyX86e)
                            .then(() => {
                            Utils.display(`   Copied: ${dest}`);
                            Promise.resolve();
                        }));
                    }
                }
                return (Promise.resolve());
            });
            await Promise.all(promises);
            // write copy error to copy.err
            // this.logError();
            // Utils.display(this.mCopyErrors);
            return (Promise.resolve());
        }
        throw new TypeError("Invalid input to 'GTMSimulator::copy()' method.");
    }
    async copyProject(project, destination, copyX86e) {
        // TODO: filter method should be part of parameter (???)
        // filter method
        const filter = (file) => {
            if ((!file.includes("x86e_win64")) || ((file.includes("x86e_win64")) && copyX86e))
                return (true);
            return (false);
        };
        const items = await fsp.readdir(project, { withFileTypes: true });
        return (Promise.all(items.map((item) => {
            const src = path.join(project, item.name);
            const dest = path.join(destination, item.name);
            return (fsp.cp(src, dest, { filter, force: true, recursive: true })
                .then(() => Promise.resolve())
                .catch((err) => {
                // TODO: write copy error here (???)
                this.mCopyErrors.push(err);
                Promise.resolve();
            }));
        }))
            .then(() => Promise.resolve()));
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
            this.writePrjTypes()
        ];
        return (Promise.all(promises).then(() => Promise.resolve()));
    }
    writeConfigFile() {
        const filename = ".gtconfig";
        const obj = {
            file: this.resolveWriteHome(filename),
            middleware: (writer) => {
                const content = this.find(filename)?.content;
                // write to file
                writer.write(`${content.win_pref}\n`);
                writer.write(`${content.editor_theme}\n`);
                writer.write(`${content.projects}\n`);
                writer.write("\n");
                writer.write(`${content.local_libs}\n`);
                writer.write(`${content.ref_sys}\n`);
                writer.write("\n");
                writer.write(`${content.user_initial}\n`);
                writer.write(`${content.user_full_name}\n`);
                writer.write(`${content.project_path}\n`);
                writer.write("\n");
                writer.write(`${content.file_diff}\n`);
                writer.write("\n");
                writer.write("\n");
                writer.write(`${content.zero}\n`);
            }
        };
        return (GTMStream.write(obj));
    }
    writeConfigJsonFile() {
        const filename = ".gtconfig.json";
        const obj = {
            file: this.resolveWriteHome(filename),
            middleware: (writer) => {
                const content = JSON.stringify(this.find(filename)?.content, null, "\t");
                // write to file
                writer.write(`${content}`);
            }
        };
        return (GTMStream.write(obj));
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
            }
        };
        return (GTMStream.write(obj));
    }
    writeOpenPrjFlt() {
        const filename = ".gt_open_prj_flt";
        const obj = {
            file: this.resolveWriteHome(filename),
            middleware: (writer) => {
                writer.write("");
            }
        };
        return (GTMStream.write(obj));
    }
    writePrjFlt() {
        const filename = ".gt_proj_flt";
        const obj = {
            file: this.resolveWriteHome(filename),
            middleware: (writer) => {
                writer.write("");
            }
        };
        return (GTMStream.write(obj));
    }
    writeDefTags() {
        const filename = ".gtdeftags";
        const obj = {
            file: this.resolveWriteHome(filename),
            middleware: (writer) => {
                writer.write("");
            }
        };
        return (GTMStream.write(obj));
    }
    writeDeftgts() {
        const filename = ".gtdeftgts";
        const obj = {
            file: this.resolveWriteHome(filename),
            middleware: (writer) => {
                writer.write("");
            }
        };
        return (GTMStream.write(obj));
    }
    writeLntfilt() {
        const filename = ".gtlntfilt";
        const obj = {
            file: this.resolveWriteHome(filename),
            middleware: (writer) => {
                writer.write("");
            }
        };
        return (GTMStream.write(obj));
    }
    writeCshrc() {
        const filename = ".gtm_cshrc";
        const obj = {
            file: this.resolveWriteHome(filename),
            middleware: (writer) => {
                // this.content.data
                const data = this.find(filename)?.content.data;
                writer.write(data);
            }
        };
        return (GTMStream.write(obj));
    }
    writePrjTypes() {
        const filename = ".gtprj_types";
        const obj = {
            file: this.resolveWriteHome(filename),
            middleware: (writer) => {
                // this.content.data
                const data = this.find(filename)?.content.data;
                writer.write(data);
            }
        };
        return (GTMStream.write(obj));
    }
}
//# sourceMappingURL=gtmsimulator.js.map