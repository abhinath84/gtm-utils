"use strict";
import inquirer from "inquirer";
import { UsageError } from "../core/errors.js";
import { Utils } from "../utils/utility.js";
import { GTMSimulator } from "../api/gtmsimulator.js";
function validateOption(input) {
    const msgs = [];
    // check '\\<hostname>\projects is accessible or not
    if (!input.exportInWorkingDir) {
        if (!Utils.FilesystemStream.writable(input.destination)) {
            msgs.push(`Unable to access '${input.destination}'.`);
        }
    }
    return msgs;
}
function ask() {
    const questions = [
        {
            type: "confirm",
            name: "exportInWorkingDir",
            message: "Export in Working directory?",
            default: true,
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
            },
        },
    ];
    return inquirer.prompt(questions);
}
const api = (input) => {
    const errors = validateOption(input);
    if (errors.length > 0) {
        throw new UsageError(`${errors.join("\n")}`);
    }
    const simulator = new GTMSimulator();
    return simulator.export(input);
};
const cli = () => 
// enquire user input
ask().then((answers) => {
    Utils.display("\n");
    // validate command options
    const input = {
        exportInWorkingDir: answers.exportInWorkingDir,
        destination: answers.destination,
    };
    // call 'run' api.
    return api(input);
});
export { api, cli };
//# sourceMappingURL=export.js.map