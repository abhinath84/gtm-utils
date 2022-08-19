"use strict";

import path from "path";
import * as fs from "fs";
import * as fsp from "fs/promises";
import os from "os";

import { SetupInputs, ImportInput, ExportInput } from "../utils/types.js";
import {
  ReadFileMiddleware,
  ReadLineMiddleware,
  Stream,
} from "../utils/istream.js";
import { GTMRead, GTMWrite, ReadMiddleware, GTMStream } from "./gtmstream.js";
import { Utils } from "../utils/utility.js";
import { UsageError } from "../core/errors.js";

type GTMFileInfo = {
  filename: string;
  content: any;
};

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

function padTo2Digits(num: number) {
  return num.toString().padStart(2, "0");
}

function displayDuration(start: Date, end: Date) {
  const duration = end.getTime() - start.getTime();
  const hms = Utils.formatToHMS(duration);

  const hmsStr = `Duration(H:M:S) : ${padTo2Digits(hms.hr)}:${padTo2Digits(
    hms.min
  )}:${padTo2Digits(hms.sec)}`;
  Utils.display(hmsStr);
}

export class GTMSimulator {
  private mGTMInfos: GTMFileInfo[];

  // private mHome: string;
  private mProjectsPath: string;
  private mLocalLibsPath: string;
  private mHomeReadPath: string;
  private mHomeWritePath: string;

  private mCopyErrors: Error[];

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

  async setup(input: SetupInputs): Promise<string> {
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
    this.mProjectsPath = input.projectPath;
    this.mLocalLibsPath = input.localLibsPath;

    const start = new Date();
    // read from local home directory
    await this.readFromHome();

    Utils.display("");
    // copy projects
    const localProjectsPath = `\\\\${os.hostname()}\\projects`;
    const remoteProjectsPath = `\\\\${input.hostname}\\projects`;
    const projects = this.find(".gtconfig")?.content?.projects.split(" ");
    const options = {
      copyX86e: input.copyX86e,
      copyRun: input.copyRun,
      copyTestrun: input.copyTestrun,
    };
    await this.copy(localProjectsPath, remoteProjectsPath, projects, options);

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

  // export(input: ExportInput) {
  // }

  // import(input: ImportInput) {
  // }

  private init() {
    GTMRELATEDFILES.forEach((file) =>
      this.mGTMInfos.push({ filename: file, content: {} })
    );
  }

  private find(filename: string): GTMFileInfo | undefined {
    return this.mGTMInfos.find((elem) => elem.filename === filename);
  }

  private insert(data: GTMFileInfo) {
    const item = this.find(data.filename);
    if (item) {
      item.content = data.content;
    } else {
      this.mGTMInfos.push(data);
    }
  }

  private resolveReadHome(filename: string): string {
    if (this.mHomeReadPath) {
      const resolvedPath =
        filename.length > 0 ? path.resolve(this.mHomeReadPath, filename) : "";
      return resolvedPath;
    }

    throw new UsageError("Local 'HOME' environment variable is missing!");
  }

  private resolveWriteHome(filename: string): string {
    if (this.mHomeWritePath) {
      const resolvedPath =
        filename.length > 0 ? path.resolve(this.mHomeWritePath, filename) : "";
      return resolvedPath;
    }

    throw new UsageError("Remote 'HOME' environment variable is missing!");
  }

  private readFromHome(): Promise<void> {
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

  private readConfigFile(): Promise<void> {
    const filename = ".gtconfig";

    const projectsPath = this.mProjectsPath;
    const localLibsPath = this.mLocalLibsPath;
    const middleware: ReadMiddleware = {
      content: {},
      type: "line",
      method(content: string, lineno: number): void {
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
      },
    };

    const post = () => {
      this.insert({ filename, content: middleware.content });
    };

    const rdObj: GTMRead = {
      file: this.resolveReadHome(filename),
      middleware,
      post,
    };

    return GTMStream.read(rdObj);
  }

  private readConfigJsonFile(): Promise<void> {
    const filename = ".gtconfig.json";

    const middleware: ReadMiddleware = {
      content: {},
      type: "file",
      method(content: string): void {
        // Utils.display(lineno);
        this.content = JSON.parse(content);
      },
    };

    const post = () => {
      this.insert({ filename, content: middleware.content });
    };

    const rdObj: GTMRead = {
      file: this.resolveReadHome(filename),
      middleware,
      post,
    };

    return GTMStream.read(rdObj);
  }

  private readProjectFile(): Promise<void> {
    const filename = ".gtprj";

    const baseProjectsPath = this.mProjectsPath.split("\\")[0];
    const projectsPath = this.mProjectsPath;
    const middleware: ReadMiddleware = {
      content: {
        projects: [],
      },
      type: "line",
      method(content: string, lineno: number): void {
        // Utils.display(lineno);
        if (lineno === 1) {
          this.content.projects.push(path.join(baseProjectsPath, "\\"));
        } else if (content[0] === "/" && content[1] === "/") {
          this.content.projects.push(content);
        } else {
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

    const rdObj: GTMRead = {
      file: this.resolveReadHome(filename),
      middleware,
      post,
    };

    return GTMStream.read(rdObj);
  }

  private readPrjFlt(): Promise<void> {
    const filename = ".gt_proj_flt";

    const middleware: ReadMiddleware = {
      content: {},
      type: "file",
      method(content: string): void {
        // Utils.display(lineno);
        this.content.data = content;
      },
    };

    const post = () => {
      this.insert({ filename, content: middleware.content });
    };

    const rdObj: GTMRead = {
      file: this.resolveReadHome(filename),
      middleware,
      post,
    };

    return GTMStream.read(rdObj);
  }

  private readOpenPrjFlt(): Promise<void> {
    const filename = ".gt_open_prj_flt";

    const middleware: ReadMiddleware = {
      content: {},
      type: "file",
      method(content: string): void {
        // Utils.display(lineno);
        this.content.data = content;
      },
    };

    const post = () => {
      this.insert({ filename, content: middleware.content });
    };

    const rdObj: GTMRead = {
      file: this.resolveReadHome(filename),
      middleware,
      post,
    };

    return GTMStream.read(rdObj);
  }

  private readDefTags(): Promise<void> {
    const filename = ".gtdeftags";

    const middleware: ReadMiddleware = {
      content: {},
      type: "file",
      method(content: string): void {
        // Utils.display(lineno);
        this.content.data = content;
      },
    };

    const post = () => {
      this.insert({ filename, content: middleware.content });
    };

    const rdObj: GTMRead = {
      file: this.resolveReadHome(filename),
      middleware,
      post,
    };

    return GTMStream.read(rdObj);
  }

  private readDeftgts(): Promise<void> {
    const filename = ".gtdeftgts";

    const middleware: ReadMiddleware = {
      content: {},
      type: "file",
      method(content: string): void {
        // Utils.display(lineno);
        this.content.data = content;
      },
    };

    const post = () => {
      this.insert({ filename, content: middleware.content });
    };

    const rdObj: GTMRead = {
      file: this.resolveReadHome(filename),
      middleware,
      post,
    };

    return GTMStream.read(rdObj);
  }

  private readLntfilt(): Promise<void> {
    const filename = ".gtlntfilt";

    const middleware: ReadMiddleware = {
      content: {},
      type: "file",
      method(content: string): void {
        // Utils.display(lineno);
        this.content.data = content;
      },
    };

    const post = () => {
      this.insert({ filename, content: middleware.content });
    };

    const rdObj: GTMRead = {
      file: this.resolveReadHome(filename),
      middleware,
      post,
    };

    return GTMStream.read(rdObj);
  }

  private readCshrc(): Promise<void> {
    const filename = ".gtm_cshrc";

    const middleware: ReadMiddleware = {
      content: {},
      type: "file",
      method(content: string): void {
        // Utils.display(content);
        this.content.data = content;
      },
    };

    const post = () => {
      this.insert({ filename, content: middleware.content });
      // Utils.display(this.find(filename)?.content.data);
    };

    const rdObj: GTMRead = {
      file: this.resolveReadHome(filename),
      middleware,
      post,
    };

    return GTMStream.read(rdObj);
  }

  private readPrjTypes(): Promise<void> {
    const filename = ".gtprj_types";

    const middleware: ReadMiddleware = {
      content: {},
      type: "file",
      method(content: string): void {
        this.content.data = content;
      },
    };

    const post = () => {
      this.insert({ filename, content: middleware.content });
    };

    const rdObj: GTMRead = {
      file: this.resolveReadHome(filename),
      middleware,
      post,
    };

    return GTMStream.read(rdObj);
  }

  private async copy(
    source: string,
    destination: string,
    projects: string[],
    options: any
  ): Promise<void> {
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
      const promises = projects.map((project: string) => {
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
      // Utils.display(this.mCopyErrors);

      return Promise.resolve();
    }

    throw new TypeError("Invalid input to 'GTMSimulator::copy()' method.");
  }

  private async copyProject(
    project: string,
    destination: string,
    options: any
  ): Promise<void> {
    // TODO: filter method should be part of parameter (???)
    // filter method
    const filter = (file: string): boolean => {
      // ignore x86e_win64 folder
      if (file.includes("x86e_win64") && !options.copyX86e) return false;
      // // ignore run folder
      // if (file.includes("run") && !options.copyRun) return false;
      // // ignore run folder
      // if (file.includes("testrun") && !options.copyTestrun) return false;
      // copy
      return true;
    };

    const items = await fsp.readdir(project, { withFileTypes: true });
    return Promise.all(
      items.map((item) => {
        const src = path.join(project, item.name);
        const dest = path.join(destination, item.name);

        // if no need to copy 'testrun', 'run', 'data', then make empty directory with corresponding directory name.
        if ((src.includes("run") && !options.copyRun)
           || (src.includes("testrun") && !options.copyTestrun)) {
          return fsp.mkdir(dest).catch((err) => {
            this.mCopyErrors.push(err);
            Promise.resolve();
          });
        }
        // if (src.includes("testrun") && !options.copyTestrun) return fsp.mkdir(dest);

        // else copy entire directory.
        return fsp
          .cp(src, dest, { filter, force: true, recursive: true })
          .then(() => Promise.resolve())
          .catch((err) => {
            // TODO: write copy error here (???)
            this.mCopyErrors.push(err);
            Promise.resolve();
          });
      })
    ).then(() => Promise.resolve());
  }

  private writeCopyError(): Promise<void> {
    const middleware = (writer: fs.WriteStream): void => {
      // write to file
      this.mCopyErrors.forEach((err: Error) => {
        // convert error to string
        writer.write(`${err.toString()}\n`);
      });
    };

    const obj: GTMWrite = {
      file: "copy.err",
      middleware,
    };

    return GTMStream.write(obj);
  }

  private writeToHome(): Promise<void> {
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

  private writeConfigFile(): Promise<void> {
    const filename = ".gtconfig";

    const obj: GTMWrite = {
      file: this.resolveWriteHome(filename),
      middleware: (writer: fs.WriteStream): void => {
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
      },
    };

    return GTMStream.write(obj);
  }

  private writeConfigJsonFile(): Promise<void> {
    const filename = ".gtconfig.json";

    const obj: GTMWrite = {
      file: this.resolveWriteHome(filename),
      middleware: (writer: fs.WriteStream): void => {
        const content = JSON.stringify(
          this.find(filename)?.content,
          null,
          "\t"
        );

        // write to file
        writer.write(`${content}`);
      },
    };

    return GTMStream.write(obj);
  }

  private writeProjectFile(): Promise<void> {
    const filename = ".gtprj";

    const obj: GTMWrite = {
      file: this.resolveWriteHome(filename),
      middleware: (writer: fs.WriteStream): void => {
        const projects = this.find(filename)?.content.projects;

        // write to file
        projects.forEach((project: string) => {
          writer.write(`${project}\n`);
        });
      },
    };

    return GTMStream.write(obj);
  }

  private writeOpenPrjFlt(): Promise<void> {
    const filename = ".gt_open_prj_flt";

    const obj: GTMWrite = {
      file: this.resolveWriteHome(filename),
      middleware: (writer: fs.WriteStream): void => {
        writer.write("");
      },
    };

    return GTMStream.write(obj);
  }

  private writePrjFlt(): Promise<void> {
    const filename = ".gt_proj_flt";

    const obj: GTMWrite = {
      file: this.resolveWriteHome(filename),
      middleware: (writer: fs.WriteStream): void => {
        writer.write("");
      },
    };

    return GTMStream.write(obj);
  }

  private writeDefTags(): Promise<void> {
    const filename = ".gtdeftags";

    const obj: GTMWrite = {
      file: this.resolveWriteHome(filename),
      middleware: (writer: fs.WriteStream): void => {
        writer.write("");
      },
    };

    return GTMStream.write(obj);
  }

  private writeDeftgts(): Promise<void> {
    const filename = ".gtdeftgts";

    const obj: GTMWrite = {
      file: this.resolveWriteHome(filename),
      middleware: (writer: fs.WriteStream): void => {
        writer.write("");
      },
    };

    return GTMStream.write(obj);
  }

  private writeLntfilt(): Promise<void> {
    const filename = ".gtlntfilt";

    const obj: GTMWrite = {
      file: this.resolveWriteHome(filename),
      middleware: (writer: fs.WriteStream): void => {
        writer.write("");
      },
    };

    return GTMStream.write(obj);
  }

  private writeCshrc(): Promise<void> {
    const filename = ".gtm_cshrc";

    const obj: GTMWrite = {
      file: this.resolveWriteHome(filename),
      middleware: (writer: fs.WriteStream): void => {
        // this.content.data
        const data = this.find(filename)?.content.data;
        writer.write(data);
      },
    };

    return GTMStream.write(obj);
  }

  private writePrjTypes(): Promise<void> {
    const filename = ".gtprj_types";

    const obj: GTMWrite = {
      file: this.resolveWriteHome(filename),
      middleware: (writer: fs.WriteStream): void => {
        // this.content.data
        const data = this.find(filename)?.content.data;
        writer.write(data);
      },
    };

    return GTMStream.write(obj);
  }
}
