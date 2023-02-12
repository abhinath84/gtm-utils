"use strict";

// import node in-build or node_modules modules.
import fs from "fs";
import path from "path";
import chalk from "chalk";
import figlet from "figlet";
import { Command } from "commander";

import pack from "../../../package.json" assert {type: "json"};

// import project related modules.
import { parseProgram } from "./commands.js";
import { Utils } from "../utils/utility.js";
import { errorHandler } from "./errors.js";
import { loadModule } from "../utils/esm.js";

// const __filename = Utils.filename();
const __dirname = Utils.dirname(import.meta.url);

const cmdDirs = path.join(__dirname, "../cmd");

const pkg = Utils.packageJson();

interface Engine {
  isLoaded: boolean;
  readonly version: string;
  [key: string]: any;
}

const api: any = {};
const cli: any = {};

// It makes sense to ensure that lounger was bootstrapped properly,
// especially for programmatic use.
// To keep track of the async bootstrapping `status`, we set `lounger.loaded` to `false`.
export const engine: Engine = {
  isLoaded: false,
  version: Utils.packageJson().version,
};

function showFiglet() {
  // clear();
  // TODO: pad according to shell window width.
  const figletText = figlet.textSync(`   ${pkg.name.toUpperCase()}`, { horizontalLayout: "full" });
  Utils.display(chalk.cyan(`${figletText}v${engine.version}`));
  Utils.display("\n");
}

// TODO: replace value: any to value: Object|Function
function register(parent: any, child: any, cmd: string): void {
  if (Object.prototype.toString.call(child) === "[object Function]" || typeof child === "function") {
    parent[cmd] = child; // eslint-disable-line no-param-reassign
  } else if (Object(child) === child) {
    Object.keys(child).forEach((key) => {
      if (Object.prototype.toString.call(child[key]) === "[object Function]" || typeof child[key] === "function") {
        parent[key] = child[key]; // eslint-disable-line no-param-reassign
      }
    });
  }
}

function loadCmds(files: string[]): Promise<boolean> {
  if (files && files.length > 0) {
    const jsFiles = files.filter((file) => file.match(/(.*)\.js$/));

    // load modules
    const promises = jsFiles.map((jsFile) =>
      loadModule(path.resolve(cmdDirs, jsFile)).then((module) => ({
        cmd: jsFile.match(/(.*)\.js$/)![1],
        mod: module,
      }))
    );

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

function loadCallback(): Promise<Engine> {
  return new Promise((resolve, reject) => {
    fs.readdir(cmdDirs, (err, files) => {
      if (err) {
        reject(err);
      } else {
        loadCmds(files)
          .then((loaded) => {
            engine.isLoaded = loaded;

            if (loaded) return resolve(engine);
            return reject(new TypeError("Fail to load command modules."));
          })
          .catch(reject);
      }
    });
  });
}

function parseCallback(): Command {
  showFiglet();

  return parseProgram();
}

function actionCallback(cmd: string, options: any): void {
  // showFiglet();

  // check
  if (cli[cmd]) {
    cli[cmd].apply(null, [options]).catch(errorHandler);
  } else {
    throw new TypeError(`${cmd} is not present in 'engine' module.`);
  }
}

// Assigning functions to engine object.
engine.load = loadCallback;
engine.parse = parseCallback;
engine.action = actionCallback;

Object.defineProperty(engine, "commands", {
  get: () => {
    if (engine.isLoaded === false) {
      throw new Error("run engine.load before");
    }

    return api;
  },
});

Object.defineProperty(engine, "cli", {
  get: () => {
    if (engine.isLoaded === false) {
      throw new Error("run engine.load before");
    }

    return cli;
  },
});
