"use strict";

// import standard node modules or modules from node_modules
import { existsSync } from "fs";
import * as path from "path";
import * as fsp from "fs/promises";

// import project modules
import { UsageError } from "../core/errors.js";
import { Utils } from "../utils/utility.js";

const cmdMsg = `Please check Usage for 'gtm' command using below command:
command: csunit help gtm`;

function isPathExists(name: string): boolean {
  if (name && name.length > 0) return (existsSync(name));
  return (false);
}

function createFile(file: string): Promise<boolean> {
  if (file && file.length > 0) {
    return (fsp.open(file, "w")
      .then((handler) => {
        handler.close();

        return (Promise.resolve(true));
      })
    );
  }
  return (Promise.reject(new TypeError("Invalid input : file")));
}

function cp(sourceFile: string, destinationFile: string): Promise<boolean> {
  return (fsp.copyFile(sourceFile, destinationFile).then(() => Promise.resolve(true)));
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

function mkProjSubDirs(projPath: string): Promise<boolean[]> {
  const projSubDirs = [
    ".gtdata",
    ".gtsub",
    "data",
    "obj",
    "run",
    "testrun",
  ];

  if (projPath) {
    const promises = projSubDirs.map((dir) => {
      const destination = path.join(projPath, dir);
      return (fsp.mkdir(destination, { recursive: true })
        .then((/* response */) => Promise.resolve(true))
      );
    });

    return (Promise.all(promises));
  }
  return (Promise.reject(new TypeError("Invalid project path.")));
}

function updateHomeGtconfig(name: string): Promise<boolean> {
  //
  const homeDir = process.env.HOME;

  if (homeDir) {
    if (existsSync(homeDir)) {
      // read data from 'HOME' config file.
      const gtconfig = path.join(homeDir, ".gtconfig");
      if (existsSync(gtconfig)) {
        return fsp.readFile(gtconfig, "utf-8").then((data) => {
          // do manipulation with data
          const arr = data.split(/\r?\n/);
          const updatedProjectList = `${arr[2]}${name} `;

          // update projectList by adding new one.
          const content = data.replace(arr[2], updatedProjectList);

          return (fsp.writeFile(gtconfig, content).then(() => Promise.resolve(true)));
        });
      }
      return (Promise.reject(new UsageError(`'.gtconfig' file not exists inside HOME (${homeDir})`)));
    }
    return (Promise.reject(
      new UsageError(
        "'HOME' environment variable either not a directory or doesn't exists the directory."
      )
    )
    );
  }
  return (Promise.reject(
    new UsageError(
      "'HOME' environment variable is not set, please set it before proceed further."
    )
  )
  );
}

function createEmptyFiles(gtdataPath: string): Promise<boolean[]> {
  const gtdataEmptyFiles = [
    "dobjs.txt",
    "moved.txt",
    "recomp.txt",
    "targets.txt",
    "trailpath.txt"
  ];

  if (gtdataPath && gtdataPath.length > 0) {
    const promises = gtdataEmptyFiles.map((file) => {
      const filePath = path.join(gtdataPath, file);

      return (createFile(filePath));
    });

    return (Promise.all(promises));
  }
  return (Promise.reject(new TypeError("Invalid input gtdataPath")));
}

class UIGtm {
  private _refSystem: string;

  private _projectPath: string;

  private _sourcePath: string;

  constructor(refSystem: string) {
    this._refSystem = refSystem;
    this._projectPath = "";

    this._sourcePath = path.join(Utils.dirname(import.meta.url), "../../../../../api/cpp");
  }

  public create(name: string): Promise<string> {
    return (this._setup()
      .then((/* done */) => {
        const validationErrors = this._validate();
        if (validationErrors.length === 0) {
          const projPath = path.join(this._projectPath, name);
          if (!isPathExists(projPath)) {
            // create empty uigtm project folder.
            return (this._create(name)
              .then((created) => {
                if (created) {
                  // copy/paste files from 'public/api/cpp' to newly created uigtm project.
                  return (this._update(name)
                    .then(() => Promise.resolve(`${name} - UIGTM project is created.`))
                  );
                }

                return (Promise.reject(new UsageError(`Unable to create UIGTM project - ${name}`)));
              })
            );
          }
          return (Promise.reject(new UsageError(`${projPath} - UIGTM project already exists.
Please remove existing project before creating project with same name.
OR
use (-u, --update <projname>) option to update existing project.

${cmdMsg}`)));
        }
        return (Promise.reject(new TypeError(validationErrors.join("\n"))));
      })
    );
  }

  public update(name: string): Promise<string> {
    return (this._setup()
      .then((/* done */) => {
        const validationErrors = this._validate();
        if (validationErrors.length === 0) {
          const projPath = path.join(this._projectPath, name);
          if (isPathExists(projPath)) {
            // copy/paste files from 'public/api/cpp' to newly created uigtm project.
            return (this._update(name).then(() => Promise.resolve(`${name} - UIGTM project is updated.`)));
          }
          return (Promise.reject(new UsageError(`${projPath} - UIGTM project doesn't exists.
Please provide a valid UIGTM project name.
OR
use (-n, --new <projname>) option to create a new project with same name.

${cmdMsg}`)));
        }
        return (Promise.reject(new TypeError(validationErrors.join("\n"))));
      })
    );
  }

  // TODO: return Promise<void> instead Promise<boolean>
  private _setup(): Promise<boolean> {
    const homeDir = process.env.HOME;

    if (homeDir) {
      if (existsSync(homeDir)) {
        // read data from 'HOME' config file.
        const gtconfig = path.join(homeDir, ".gtconfig");
        if (existsSync(gtconfig)) {
          return fsp.readFile(gtconfig, "utf-8").then((data) => {
            // split into single lines.
            const arr = data.split(/\r?\n/);

            // set ref-system if not set
            if (this._refSystem && this._refSystem.length === 0) {
              this._refSystem = arr[5];
            }

            // set UIGTM project-path
            this._projectPath = arr[9];

            return (Promise.resolve(true));
          });
        }
        return (Promise.reject(new UsageError(`'.gtconfig' file not exists inside HOME (${homeDir})`)));
      }
      return (Promise.reject(
        new UsageError(
          "'HOME' environment variable either not a directory or doesn't exists the directory."
        )
      )
      );
    }
    return (Promise.reject(
      new UsageError(
        "'HOME' environment variable is not set, please set it before proceed further."
      )
    )
    );
  }

  private _validate(): string[] {
    const msgs = [];

    // ref-system
    if (this._refSystem && this._refSystem.length === 0) {
      msgs.push("Invalid input - UIGTM reference system.");
    }

    if (!isPathExists(this._refSystem)) {
      msgs.push("UIGTM reference system does nor exists.");
    }

    // proj-path
    if (this._projectPath && this._projectPath.length === 0) {
      msgs.push("Invalid input - UIGTM projects path.");
    }

    if (!isPathExists(this._projectPath)) {
      msgs.push("UIGTM projects path does not exists.");
    }

    // creo-saas-backend c++-api source directory
    if (this._sourcePath && this._sourcePath.length === 0) {
      msgs.push("Invalid input - Creo-SaaS backend C++ api source path.");
    }

    // creo-saas-backend c++-api source directory access
    if (!isPathExists(this._sourcePath)) {
      msgs.push("Creo-SaaS backend C++ api source path does not exists.");
    }

    return (msgs);
  }

  // TODO: return Promise<void> instead Promise<boolean>
  private async _create(name: string): Promise<boolean> {
    try {
      const projPath = path.join(this._projectPath, name);

      // create directories
      await mkProjSubDirs(projPath);

      // create empty files
      const gtdataPath = path.join(projPath, ".gtdata");
      await createEmptyFiles(gtdataPath);

      // create prjinfo files
      await this._createPrjinfoFile(name, gtdataPath);

      // create prjinfo files
      await this._createPrjinfoJsonFile(gtdataPath);

      // update 'HOME' config files
      await updateHomeGtconfig(name);
      await this._updateHomeGtprj(name);

      return (Promise.resolve(true));
    } catch (err) {
      return (Promise.reject(err));
    }
  }

  private _createPrjinfoFile(name: string, gtdataPath: string): Promise<boolean> {
    // const __dirname = Utils.dirname(import.meta.url);
    const templates = path.join(Utils.dirname(import.meta.url), "../../templates");
    const prjinfoTmpl = path.join(templates, "prjinfo.tmpl");

    return fsp.readFile(prjinfoTmpl, "utf-8").then((data) => {
      // do manipulation with data
      let content = Utils.format(data, "refSystem", this._refSystem);
      content = Utils.format(content, "projectName", name);

      // write in destination
      const prjinfo = path.join(gtdataPath, "prjinfo");
      return fsp.writeFile(prjinfo, content).then((/* response */) => (Promise.resolve(true)));
    });
  }

  private _createPrjinfoJsonFile(gtdataPath: string): Promise<boolean> {
    const content = `{
  "ref_sys": "${this._refSystem.replace("\\", "\\\\")}",
  "local_git": 0,
  "git_link": ""
}`;

    const prjinfoJson = path.join(gtdataPath, "prjinfo.json");
    // write in destination
    return fsp.writeFile(prjinfoJson, content).then((/* response */) => Promise.resolve(true));
  }

  private _updateHomeGtprj(name: string): Promise<boolean> {
    //
    const homeDir = process.env.HOME;

    if (homeDir) {
      if (existsSync(homeDir)) {
        // read data from 'HOME' config file.
        const gtprj = path.join(homeDir, ".gtprj");
        if (existsSync(gtprj)) {
          return fsp.readFile(gtprj, "utf-8").then((data) => {
            // do manipulation with data
            const arr = data.split(/\r?\n/);
            const proj = path.join(this._projectPath, name);
            const content = arr[arr.length - 1] === "" ? proj : `\n${proj}`;
            return (fsp.appendFile(gtprj, content).then((/* response */) => Promise.resolve(true)));
          });
        }
        return (Promise.reject(new UsageError(`'.gtprj' file not exists inside HOME (${homeDir})`)));
      }
      return (Promise.reject(
        new UsageError(
          "'HOME' environment variable either not a directory or doesn't exists the directory."
        )
      ));
    }
    return (Promise.reject(
      new UsageError(
        "'HOME' environment variable is not set, please set it before proceed further."
      )
    ));
  }

  private _update(name: string): Promise<void> {
    const updateProjPath = path.join(this._projectPath, name);
    const saasClient = path.join(updateProjPath, "/xplatform/advapps/TK-2/apps/saas_client/");

    // copy/paste
    return (this._copyRecursively(this._sourcePath, saasClient));
  }

  private async _copyRecursively(source: string, destination: string) {
    // read current directory & loop over it's items
    const items = await fsp.readdir(source, { withFileTypes: true });
    items.forEach((item) => {
      const sourceItem = path.join(source, item.name);
      const destItem = path.join(destination, item.name);

      // if file then copy/paste
      if (item.isFile()) {
        return (copyFile(sourceItem, destItem));
      } if (item.isDirectory()) {
        return (this._copyRecursively(sourceItem, destItem));
      }

      return Promise.resolve();
    });
  }
}

const UIGTMSupport = {
  createProject(name: string, refSystem: string): Promise<string> {
    const uigtm = new UIGtm(refSystem);
    return (uigtm.create(name));
  },

  updateProject(name: string, refSystem: string): Promise<string> {
    const uigtm = new UIGtm(refSystem);
    return (uigtm.update(name));
  }
};

export { UIGTMSupport };
