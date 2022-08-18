"use strict";
import inquirer from "inquirer";
import { UsageError } from "../core/errors.js";
import { Utils } from "../utils/utility.js";
function validateOption(input) {
    const msgs = [];
    // check '\\<hostname>\projects is accessible or not
    if (!input.exportInWorkingDir) {
        if (!Utils.FilesystemStream.writable(input.destination)) {
            msgs.push(`Unable to access '${input.destination}'.`);
        }
    }
    return (msgs);
}
function ask() {
    const questions = [
        {
            type: "confirm",
            name: "exportInWorkingDir",
            message: "Export in Working directory?",
            default: true
        },
        {
            type: "input",
            name: "destination",
            message: "Specify destination directory",
            default() {
                return "";
            },
            when(answer) {
                return !answer.exportInWorkingDir;
            },
            validate(value) {
                if (value.length > 0) {
                    // check valid folder path
                    if (Utils.FilesystemStream.validate(value))
                        return true;
                    return "Please enter valid destination directory";
                }
                // TODO: how to verify proper hostname
                return "Please enter destination directory";
            }
        }
    ];
    return (inquirer.prompt(questions));
}
const api = (input) => {
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
//       // validate command options
//       const input = {
//         exportInWorkingDir: answers.exportInWorkingDir,
//         destination: answers.destination
//       };
//       // call 'run' api.
//       return (
//         api(input)
//           .then((response) => {
//             Utils.display(response);
//             return (Promise.resolve(response));
//           })
//       );
//     })
// );
const cli = () => {
    Utils.display("In-progress !!!");
    return (Promise.resolve("In-progress !!!"));
};
export { api, cli };
//# sourceMappingURL=export.js.map