"use strict";
import inquirer from "inquirer";
import { UsageError } from "../core/errors.js";
import { Utils } from "../utils/utility.js";
function validateOption(input) {
    const msgs = [];
    // check source directory is accessible or not
    if (!Utils.FilesystemStream.readable(input.source)) {
        msgs.push(`Unable to access '${input.source}'.`);
    }
    return (msgs);
}
function ask() {
    const questions = [
        {
            type: "input",
            name: "source",
            message: "Specify uigtm.json file to import",
            validate(value) {
                if (value.length > 0) {
                    // check valid folder path
                    if (Utils.FilesystemStream.validate(value))
                        return true;
                    return "Please enter valid filename to import";
                }
                // TODO: how to verify proper hostname
                return "Please enter filename to import";
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
const api = (input) => {
    const errors = validateOption(input);
    if (errors.length > 0) {
        throw (new UsageError(`${errors.join("\n")}`));
    }
    Utils.display(input);
    return (Promise.resolve("In-progress!"));
};
const cli = () => (
// enquire user input
ask()
    .then((answers) => {
    Utils.display("\n");
    // call 'run' api.
    return (api({ source: answers.source, copyX86e: answers.copyX86e })
        .then((response) => {
        Utils.display(response);
        return (Promise.resolve(response));
    }));
}));
export { api, cli };
//# sourceMappingURL=import.js.map