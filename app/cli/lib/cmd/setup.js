"use strict";
import inquirer from "inquirer";
import { UsageError } from "../core/errors.js";
import { Utils } from "../utils/utility.js";
import { GTMSimulator } from "../api/gtmsimulator.js";
function validateOption(input) {
    const msgs = [];
    // check '\\<hostname>\projects is accessible or not
    const projectsPath = `\\\\${input.hostname}\\projects`;
    if (!Utils.FilesystemStream.writable(projectsPath)) {
        msgs.push(`Unable to access '${projectsPath}'.Either this folder is not shared or doesn't have write permission`);
    }
    // // check '\\<hostname>\HOME is accessible or not
    // const homePath = `\\\\${input.hostname}\\HOME`;
    // if (!Utils.FilesystemStream.readable(homePath)) {
    //   msgs.push(`Unable to access '${homePath}'.Either this folder is not shared or doesn't have write permission`);
    // }
    return msgs;
}
function ask() {
    const questions = [
        {
            type: "input",
            name: "remote_host",
            message: "Remote hostname",
            validate(value) {
                // check for empty string
                if (value.length > 0) {
                    return true;
                }
                // TODO: how to verify proper hostname
                return "Please enter remote host(machine) name";
            },
        },
        {
            type: "input",
            name: "remote_homedir",
            message: "Remote 'HOME' environment directory name",
            validate(value) {
                // check for empty string
                if (value.length > 0) {
                    return true;
                }
                // TODO: how to verify proper hostname
                return "Please enter remote HOME environment directory name";
            },
        },
        {
            type: "input",
            name: "remote_projectpath",
            message: "Path for projects in remote host",
            validate(value) {
                if (value.length > 0) {
                    // check valid folder path
                    if (Utils.FilesystemStream.validate(value))
                        return true;
                    return "Please enter valid path for projects in remote host";
                }
                // TODO: how to verify proper hostname
                return "Please enter path for projects in remote host";
            },
        },
        {
            type: "input",
            name: "remote_lacalLibspath",
            message: "Path to local libraries in remote host (Optional)",
            default() {
                return "";
            },
        },
        {
            type: "confirm",
            name: "copyX86e",
            message: "Want to copy 'x86e_win64' folder?",
            default: false,
        },
        {
            type: "confirm",
            name: "copyRun",
            message: "Want to copy contents of 'run' folder?",
            default: true,
        },
        {
            type: "confirm",
            name: "copyTestrun",
            message: "Want to copy contents of 'testrun' folder?",
            default: true,
        },
        {
            type: "confirm",
            name: "copyData",
            message: "Want to copy contents of 'data' folder?",
            default: true,
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
    return simulator.setup(input);
};
// eslint-disable-next-line no-promise-executor-return
const cli = ( /* option: any */) => new Promise((resolve, reject) => ask()
    .then((answers) => {
    // Utils.display(JSON.stringify(answers, null, "\t"));
    Utils.display("\n");
    // validate command options
    const input = {
        hostname: answers.remote_host,
        homeDir: answers.remote_homedir,
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
    return api(input)
        .then((response) => {
        Utils.display(response);
        resolve(response);
    })
        .catch(reject);
})
    .catch(reject));
export { api, cli };
//# sourceMappingURL=setup.js.map