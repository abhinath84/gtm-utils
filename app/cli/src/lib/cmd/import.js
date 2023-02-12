"use strict";
import inquirer from "inquirer";
import { UsageError } from "../core/errors.js";
import { Utils } from "../utils/utility.js";
import { GTMSimulator } from "../api/gtmsimulator.js";
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
            type: "input",
            name: "projectPath",
            message: "Path for projects",
            validate(value) {
                if (value.length > 0) {
                    // check valid folder path
                    if (Utils.FilesystemStream.validate(value))
                        return true;
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
const api = (input) => {
    const errors = validateOption(input);
    if (errors.length > 0) {
        throw new UsageError(`${errors.join("\n")}`);
    }
    const simulator = new GTMSimulator();
    return simulator.import(input);
};
const cli = () => 
// enquire user input
ask().then((answers) => {
    Utils.display("\n");
    // validate command options
    const input = {
        source: answers.source,
        gtmInput: {
            projectPath: answers.remote_projectpath,
            localLibsPath: answers.remote_lacalLibspath,
            copyX86e: answers.copyX86e,
            copyRun: answers.copyRun,
            copyTestrun: answers.copyTestrun,
            copyData: answers.copyData
        }
    };
    // call 'run' api.
    return api(input);
});
export { api, cli };
//# sourceMappingURL=import.js.map