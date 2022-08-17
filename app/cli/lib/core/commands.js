"use strict";
// import standard & node_modules
import { Command } from "commander";
// import project modules
import { gtm } from "./gtm.js";
import { Utils } from "../utils/utility.js";
const pkg = Utils.packageJson();
// function collect(val: string, collection: string[]): string[] {
//   collection.push(val);
//   return collection;
// }
// add commands.
const program = new Command();
program
    .name("gtm-utils")
    .version(pkg.version)
    .description("Command-line interface for UIGTM application");
// Setup uigtm in remote PC using uigtm project of this PC
program
    .command("setup")
    .description("Setup uigtm in remote PC using uigtm project of this PC")
    // .option("-n, --new <projname>", "Name of the newly created project")
    // .option("-u, --update <projname>", "Name of the project to update")
    // .option("-rs, --ref-system <refsystem>", "Reference system path for new UIGTM project")
    .action((options) => gtm.action("setup", options));
// Export uigtm projects on this PC in json format
// Use inquirer to ask below questions
// -o => all, only-projects
program
    .command("export")
    .description("Export uigtm projects on this PC in json format")
    .option("-n, --new <projname>", "Name of the newly created project")
    .option("-u, --update <projname>", "Name of the project to update")
    .option("-rs, --ref-system <refsystem>", "Reference system path for new UIGTM project")
    .action((options) => gtm.action("export", options));
// Import uigtm projects on this PC
program
    .command("import")
    .description("Import uigtm projects on this PC")
    .option("-n, --new <projname>", "Name of the newly created project")
    .option("-u, --update <projname>", "Name of the project to update")
    .option("-rs, --ref-system <refsystem>", "Reference system path for new UIGTM project")
    .action((options) => gtm.action("import", options));
// Import uigtm projects on this PC
program
    .command("remove")
    .description("Import uigtm projects on this PC")
    .option("-n, --new <projname>", "Name of the newly created project")
    .option("-u, --update <projname>", "Name of the project to update")
    .option("-rs, --ref-system <refsystem>", "Reference system path for new UIGTM project")
    .action((options) => gtm.action("remove", options));
export function parseProgram() {
    return (program.parse(process.argv));
}
//# sourceMappingURL=commands.js.map