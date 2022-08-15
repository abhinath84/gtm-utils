"use strict";

import path from "path";
// import * as fs{ existsSync, copyFileSync, mkdirSync, constants } from "fs";
import * as fs from "fs";
import * as fsp from "fs/promises";
import os from "os";

import { SetupInputs, ImportInput, ExportInput } from "../utils/types.js";
import { Stream } from "../utils/istream.js";
import { Utils } from "../utils/utility.js";
import { UsageError } from "../core/errors.js";

type GTMFileInfo = {
  filename: string;
  content: any;
}

const GTMRELATEDFILES = [
  ".gtconfig",
  ".gtprj",
  ".gt_open_prj_flt",
  ".gt_proj_flt",
  ".gtconfig.json",
  ".gtdeftags",
  ".gtdeftgts",
  ".gtlntfilt",
  ".gtm_cshrc",
  ".gtmrun",
  ".gtprj_types"
];

function cp(sourceFile: string, destinationFile: string): Promise<boolean> {
  return (fsp.copyFile(sourceFile, destinationFile)
    .then(() => Promise.resolve(true))
    .catch(() => Promise.resolve(true)));
}

function copyFile(sourceFile: string, destinationFile: string): Promise<boolean> {
  const destination = path.dirname(destinationFile);

  // check destination folder exists or not
  return (fsp.stat(destination)
    .then((/* stats */) => (cp(sourceFile, destinationFile)))
    .catch((/* err */) => {
      // if not create it(recursively)
      // paste file to destination folder.
      const promise = fsp.mkdir(destination, { recursive: true });
      return (promise.then((/* response */) => (cp(sourceFile, destinationFile))));
    })
  );
}

function cpFileSync(sourceFile: string, destinationFile: string): void {
  const dest = path.dirname(destinationFile);

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  fs.copyFileSync(sourceFile, destinationFile);
}

function copyRecursivelySync(source: string, destination: string): void {
  // read current directory & loop over it's items
  const items = fs.readdirSync(source, { withFileTypes: true });
  items.forEach((item) => {
    const sourceItem = path.join(source, item.name);
    const destItem = path.join(destination, item.name);

    // if file then copy/paste
    if (item.isFile()) {
      return (cpFileSync(sourceItem, destItem));
    } if (item.isDirectory()) {
      return (copyRecursivelySync(sourceItem, destItem));
    }
  });
}

function copyProjectSync(project: string, destination: string, shouldCopyX86e: boolean): void {
  if ((project.length > 0) && (destination.length > 0)) {
    // copy each sub-dir except x86e if it's false
    const items = fs.readdirSync(project, { withFileTypes: true });
    items.forEach((item) => {
      const src = path.join(project, item.name);
      const dest = path.join(destination, item.name);
      if (item.isFile()) {
        cpFileSync(src, dest);
      } else if (item.isDirectory()) {
        // check for x86e
        // eslint-disable-next-line no-lonely-if
        if ((item.name !== "x86e_win64") || ((item.name === "x86e_win64") && shouldCopyX86e)) {
          copyRecursivelySync(src, dest);
        }
      }
    });
  }
}

export class GTMSimulator {
  private mGTMInfos: GTMFileInfo[];
  private mHome: string;
  private mCopyErrors: Error[];

  constructor() {
    this.mGTMInfos = [];
    this.mHome = process.env.HOME || "";
    this.mCopyErrors = [];

    this.init();
  }

  setup(input: SetupInputs): Promise<string> {
    // Utils.display(input);
    const promises = [
      this.readConfigFile(),
      this.readProjectFile()
    ];

    // Utils.display(this.mCopyErrors);
    return (Promise.all(promises).then(() => {
      const hostname = os.hostname();

      // get machine name from 'os' module
      // return (this.copyProjects(hostname, "D:\\Pool\\gtm_utils", input.copyX86e)
      //   .then(() => Promise.resolve("In-process")));
      return (this.copyProjects(hostname, "D:\\Pool\\gtm_utils", input.copyX86e)
        .then(() => {
          Utils.display(this.mCopyErrors);
          return (Promise.resolve("In-process"));
        }));
    }));
  }

  // export(input: ExportInput) {
  // }

  // import(input: ImportInput) {
  // }

  private init() {
    GTMRELATEDFILES.forEach((file) => this.mGTMInfos.push({ filename: file, content: {} }));
  }

  private resolve(filename: string): string {
    const resolvedPath = (filename.length > 0) ? path.resolve(this.mHome, filename) : "";
    return (resolvedPath);
  }

  private find(filename: string): GTMFileInfo | undefined {
    return (this.mGTMInfos.find((elem) => (elem.filename === filename)));
  }

  private insert(data: GTMFileInfo) {
    const item = this.find(data.filename);
    if (item) {
      item.content = data.content;
    } else {
      this.mGTMInfos.push(data);
    }
  }

  private readConfigFile(): Promise<void> {
    const filename = ".gtconfig";
    const configPath = this.resolve(filename);
    // const stream = new Stream(configPath);
    const obj: any = {};

    const configMiddleware = (content: string, lineno: number) => {
      // Utils.display(`Line ${lineno} : ${content}`);

      switch (lineno) {
      case 1:
        obj.win_pref = content;
        break;
      case 2:
        obj.editor_theme = content;
        break;
      case 3:
        obj.projects = content;
        break;
      case 5:
        obj.local_libs = content;
        break;
      case 6:
        obj.ref_sys = content;
        break;
      case 8:
        obj.user_initial = content;
        break;
      case 9:
        obj.user_full_name = content;
        break;
      case 10:
        obj.project_path = content;
        break;
      case 12:
        obj.file_diff = content;
        break;
      case 15:
        obj.zero = content;
        break;
      default:
        // do nothing
      }
    };

    Utils.display(`Reading ${configPath} ...`);
    return (Stream.readLine(configPath, configMiddleware)
      .then(() => {
        this.insert({ filename, content: obj });

        // Utils.display(this.find(filename)?.content.projects);
        Promise.resolve();
      })
    );
  }

  private readProjectFile(): Promise<void> {
    const filename = ".gtprj";
    const configPath = this.resolve(filename);
    const obj: any = { projects: [] };

    const configMiddleware = (content: string, lineno: number) => {
      // Utils.display(`Line ${lineno} : ${content}`);

      if (lineno !== 1) obj.projects.push(content);
    };

    Utils.display(`Reading ${configPath} ...`);
    return (Stream.readLine(configPath, configMiddleware)
      .then(() => {
        this.insert({ filename, content: obj });

        // Utils.display(this.find(filename)?.content.projects);
        Promise.resolve();
      })
    );
  }

  private async copyProjects(hostname: string, dest: string, shouldCopyX86e: boolean): Promise<void> {
    if (hostname.length > 0) {
      // copy each sub-dir except x86e if it's false
      // const projects = this.find(".gtconfig")?.content?.projects.split(" ");
      // const projects = ["aim_adv_result_ref","aim_animation","aim_animation_timeline","aim_himanshu","aim_live_dll","aim_maixm","aim_nagnath","aim_pre","aim_pre_dll","aim_pre_xtop","aim_result_animation_bug","aim_result_anti_aliasing","aim_result_anti_aliasing_1","aim_result_asm_issue","aim_result_bassel","aim_result_bug","aim_result_cmd","aim_result_cmd_obsolate","aim_result_collector","aim_result_collector_comb","aim_result_comment","aim_result_console","aim_result_cross_section","aim_result_cross_section_backup","aim_result_cross_section_bug","aim_result_cross_section_clip","aim_result_cross_section_cmd","aim_result_deform","aim_result_display","aim_result_display_bug","aim_result_dll_issue","aim_result_eventloop","aim_result_explode","aim_result_graphics","aim_result_graphics_bug","aim_result_hide","aim_result_legend","aim_result_mainloop","aim_result_mesh","aim_result_mesh_bug","aim_result_min_max","aim_result_mini_toolbar","aim_result_mini_toolbar_new","aim_result_non_graphics","aim_result_p70","aim_result_p72","aim_result_p80","aim_result_plane","aim_result_refactor","aim_result_reg","aim_result_regression","aim_result_render","aim_result_ribbon","aim_result_rmb","aim_result_tareq","aim_result_template","aim_result_tmp","aim_result_universal_collector","aim_result_universal_collector_1","aim_result_view","aim_ribbon_design","aim_ribbon_design_70","aim_rishabh_aux_window","aimpost_p7217"];
      // projects.forEach(async (elem: string) => {
      // eslint-disable-next-line no-restricted-syntax
      // for (const project of projects) {
      //   const src = `\\\\${hostname}\\projects\\${project}`;

      //   if (fs.existsSync(src)) {
      //     // Utils.display(`Copying project: ${src}`);
      //     // eslint-disable-next-line no-await-in-loop
      //     await this.copyProject(src, path.join(dest, project), shouldCopyX86e);
      //     Utils.display(`Copied project: ${src}`);
      //   }
      // }

      const projects = this.find(".gtconfig")?.content?.projects.split(" ");
      const promises = projects.map((project: string) => {
        if (project.length > 0) {
          const src = `\\\\${hostname}\\projects\\${project}`;
          if (fs.existsSync(src)) {
            return (this.cpProject(src, path.join(dest, project), shouldCopyX86e)
              .then(() => {
                Utils.display(`Copied project: ${src}`);
                Promise.resolve();
              }));
          }
        }

        return (Promise.resolve());
      });

      await Promise.all(promises);

        // const src = `\\\\${hostname}\\projects\\${elem}`;
        // const prj = path.join(dest, elem);

        // if (fs.existsSync(src)) {
        //   if (fs.existsSync(prj)) {
        //     fs.rmSync(prj, { recursive: true });
        //   }

        //   copyProjectSync(src, prj, shouldCopyX86e);
        //   Utils.display(`Copied project: ${src}`);
        // }
      // });

      // const src = `\\\\${hostname}\\projects\\aim_result_display`;
      // const prj = path.join(dest, "aim_result_display");

      // await this.copyProject(src, prj, shouldCopyX86e);
      // Utils.display(`Copied project: ${src}`);

      // if (fs.existsSync(prj)) {
      //   fs.rmSync(prj, { recursive: true });
      // }

      // copyProjectSync(src, prj, shouldCopyX86e);
      // Utils.display(`Copied project: ${src}`);

      return (Promise.resolve());
    }

    throw new UsageError("Invalid uigtm project directory or destination directory");
  }

  private async cpProject(project: string, destination: string, shouldCopyX86e: boolean): Promise<void> {
    const filter = (file: string): boolean => {
      if ((!file.includes("x86e_win64")) || ((file.includes("x86e_win64")) && shouldCopyX86e)) return (true);
      return (false);
    };

    const items = await fsp.readdir(project, { withFileTypes: true });
    return (Promise.all(items.map((item) => {
      const src = path.join(project, item.name);
      const dest = path.join(destination, item.name);

      return (fsp.cp(src, dest, { filter, recursive: true })
        .then(() => Promise.resolve())
        .catch((err) => {
          this.mCopyErrors.push(err);
          Promise.resolve();
        }));
    }))
      .then(() => Promise.resolve()));

    // const filter = (file: string): boolean => {
    //   if (file.includes("x86e_win64")) return (false);
    //   return (true);
    // };

    // return (fsp.cp(project, destination, { filter, recursive: true }));
  }

  private async copyProject(project: string, destination: string, shouldCopyX86e: boolean): Promise<void> {
    if ((project.length > 0) && (destination.length > 0)) {
      // copy each sub-dir except x86e if it's false
      const items = await fsp.readdir(project, { withFileTypes: true });
      // items.forEach(async (item) => {
      //   const src = path.join(project, item.name);
      //   const dest = path.join(destination, item.name);
      //   if (item.isFile()) {
      //     await copyFile(src, dest);
      //   } else if (item.isDirectory()) {
      //     // check for x86e
      //     // eslint-disable-next-line no-lonely-if
      //     if ((item.name !== "x86e_win64") || ((item.name === "x86e_win64") && shouldCopyX86e)) {
      //       await this.copyRecursively(src, dest);
      //     }
      //   }
      // });

      await Promise.all(items.map(async (item) => {
        // const src = path.join(project, item.name);
        // const dest = path.join(destination, item.name);
        // if (item.isFile()) {
        //   await copyFile(src, dest);
        // } else if (item.isDirectory()) {
        //   // check for x86e
        //   // eslint-disable-next-line no-lonely-if
        //   if ((item.name !== "x86e_win64") || ((item.name === "x86e_win64") && shouldCopyX86e)) {
        //     await this.copyRecursively(src, dest);
        //   }
        // }

        await this.copyProjectSubDir(item, project, destination, shouldCopyX86e);
      }));

      return (Promise.resolve());
    }

    throw new UsageError("Invalid uigtm project directory or destination directory");
  }

  private copyProjectSubDir(item: fs.Dirent, project: string, destination: string, copyX86e: boolean) {
    const src = path.join(project, item.name);
    const dest = path.join(destination, item.name);

    if (item.isFile()) {
      return (copyFile(src, dest));
    }

    if (item.isDirectory()) {
      // check for x86e
      // eslint-disable-next-line no-lonely-if
      if (item.name !== "x86e_win64") {
        return (this.copyRecursively(src, dest));
      }
    }

    return (Promise.resolve());
  }

  private async copyRecursively(source: string, destination: string) {
    // read current directory & loop over it's items
    const items = await fsp.readdir(source, { withFileTypes: true });
    items.forEach((item) => {
      const sourceItem = path.join(source, item.name);
      const destItem = path.join(destination, item.name);

      // if file then copy/paste
      if (item.isFile()) {
        return (copyFile(sourceItem, destItem));
      } if (item.isDirectory()) {
        return (this.copyRecursively(sourceItem, destItem));
      }

      return Promise.resolve();
    });
  }
}
