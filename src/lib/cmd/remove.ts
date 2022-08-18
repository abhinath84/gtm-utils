"use strict";

import inquirer, { QuestionCollection, Answers } from "inquirer";

import { ImportInput } from "../utils/types.js";
import { UsageError } from "../core/errors.js";
import { Utils } from "../utils/utility.js";

function validateOption(input: ImportInput): string[] {
  const msgs: string[] = [];

  // check source directory is accessible or not
  if (!Utils.FilesystemStream.readable(input.source)) {
    msgs.push(`Unable to access '${input.source}'.`);
  }

  return (msgs);
}

function ask(): Promise<any> {
  const questions: QuestionCollection<any> = [
    {
      type: "input",
      name: "source",
      message: "Specify uigtm.json file to import",
      validate(value: string) {
        if (value.length > 0) {
          // check valid folder path
          if (Utils.FilesystemStream.validate(value)) return true;
          return "Please enter valid filename to import";
        }

        // TODO: how to verify proper hostname
        return "Please enter filename to import";
      }
    },
    {
      type: "input",
      name: "projectPath",
      message: "Path for projects",
      validate(value: string) {
        if (value.length > 0) {
          // check valid folder path
          if (Utils.FilesystemStream.validate(value)) return true;
          return "Please enter valid path for projects";
        }

        // TODO: how to verify proper hostname
        return "Please enter path for projects";
      }
    },
    {
      type: "confirm",
      name: "copyX86e",
      message: "Want to copy x86e_win64?",
      default: false
    }
  ];

  return (inquirer.prompt(questions));
}

const api = (input: ImportInput):Promise<string> => {
  const errors = validateOption(input);
  if (errors.length > 0) {
    throw (new UsageError(`${errors.join("\n")}`));
  }

  Utils.display(input);
  return (Promise.resolve("In-progress!"));
};

// const cli = (): Promise<string> => (
//   // enquire user input
//   ask()
//     .then((answers: Answers) => {
//       Utils.display("\n");

//       // call 'run' api.
//       return (
//         api({ source: answers.source, projectPath: answers.projectPath, copyX86e: answers.copyX86e })
//           .then((response) => {
//             Utils.display(response);
//             return (Promise.resolve(response));
//           })
//       );
//     })
// );

const cli = (): Promise<string> => {
  Utils.display("In-progress !!!");
  return (Promise.resolve("In-progress !!!"));
};

export { api, cli };
