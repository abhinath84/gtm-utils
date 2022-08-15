"use strict";

import chalk from "chalk";

// import project modules
import { OStream } from "../api/stream.js";
import { NodeSupport } from "../api/node.js";
import { UsageError } from "../core/errors.js";
import { Utils } from "../utils/utility.js";

export type AddOption = {
  dir: string;
  file: string[];
};

export type RunOption = {
  module: string;
  all: boolean;
}

const api = {
  add(option: AddOption): Promise<string[]> {
    return (new Promise((resolve, reject) => {
      if (!option.file) {
        OStream.createTestDir(option.dir)
          .then((values) => resolve(values))
          .catch(reject);
      } else {
        OStream.createTestFiles(option.dir, option.file)
          .then((values) => resolve(values))
          .catch(reject);
      }
    }));
  },
  remove(option: AddOption): Promise<string|string[]> {
    return (new Promise((resolve, reject) => {
      if (!option.file) {
        OStream.removeTestDir(option.dir)
          .then((values) => resolve(values))
          .catch(reject);
      } else {
        OStream.removeTestFiles(option.dir, option.file)
          .then((values) => resolve(values))
          .catch(reject);
      }
    }));
  },
  generateNodePackage(): Promise<string> { return (NodeSupport.generatePackage()); },
  listTestModules(): Promise<string[]> { return (NodeSupport.listTestModules()); },
  run(option: RunOption): Promise<unknown> {
    return (new Promise((resolve, reject) => {
      if (option.module) {
        NodeSupport.runModule(option.module)
          .then((values) => resolve(values))
          .catch(reject);
      } else if (option.all) {
        NodeSupport.runAllModules()
          .then((values) => resolve(values))
          .catch(reject);
      }
    }));
  }
};

const cli = {
  add(option: AddOption): Promise<string[]> {
    return (new Promise((resolve, reject) => {
      // check -d
      if (!option.dir) {
        reject(new UsageError(`(-d, --dir <dirname>) is a mandatory option. Please provide it.
          
${Utils.cmdUsageHelpMsg("add")}`));
      }

      // check -f
      if (option.file && typeof option.file.length === "undefined" && option.file.length === 0) {
        reject(new UsageError(`Please provide filenames when you are using (-f, --file <filenames...>) option.
          
${Utils.cmdUsageHelpMsg("add")}`));
      }

      // call 'add' api.
      api.add(option)
        .then((response) => {
          console.log(response);

          resolve(response);
        }).catch(reject);
    }));
  },
  remove(option: AddOption): Promise<string|string[]> {
    return (new Promise((resolve, reject) => {
      // check -d
      if (!option.dir) {
        reject(new UsageError(`(-d, --dir <dirname>) is a mandatory option. Please provide it.
          
  ${Utils.cmdUsageHelpMsg("remove")}`));
      }

      // check -f
      if (option.file && typeof option.file.length === "undefined" && option.file.length === 0) {
        reject(new UsageError(`Please provide filenames when you are using (-f, --file <filenames...>) option.
          
  ${Utils.cmdUsageHelpMsg("remove")}`));
      }

      // call 'add' api.
      api.remove(option)
        .then((response) => {
          console.log(response);

          resolve(response);
        }).catch(reject);
    }));
  },
  generateNodePackage(): Promise<string> {
    return (new Promise((resolve, reject) => {
      api.generateNodePackage()
        .then((response) => {
          console.log(response);

          resolve(response);
        }).catch(reject);
    }));
  },
  listTestModules(): Promise<string[]> {
    return (new Promise((resolve, reject) => {
      api.listTestModules()
        .then((response) => {
          console.log("List of test modules:");
          console.log(chalk.yellow(response.join("\n")));
          console.log("\n");

          resolve(response);
        }).catch(reject);
    }));
  },
  run(option: RunOption): Promise<unknown> {
    return (new Promise((resolve, reject) => {
      // check -d
      if (!option.module && !option.all) {
        reject(new UsageError(`(-m, --module) or (-a, --all) is a mandatory option. Please provide any of them.
          
  ${Utils.cmdUsageHelpMsg("run")}`));
      }

      // check if both new & update present
      if (option.module && option.all) {
        reject(new UsageError(`Please provide (-m, --module) or (-a, --all), not both of them.
          
  ${Utils.cmdUsageHelpMsg("run")}`));
      }

      // check -f
      if (option.module && typeof option.module.length === "undefined") {
        reject(new UsageError(`Please provide module name when you are using (-m, --module) option.
          
  ${Utils.cmdUsageHelpMsg("run")}`));
      }

      // call 'run' api.
      api.run(option)
        .then((response) => resolve(response))
        .catch(reject);
    }));
  }
};

export { api, cli };
