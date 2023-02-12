"use strict";
// import standard & node_modules
import { Command } from "commander";
// import project modules
import { engine } from "./engine.js";
import { Utils } from "../utils/utility.js";
const pkg = Utils.packageJson();
// function collect(val: string, collection: string[]): string[] {
//   collection.push(val);
//   return collection;
// }
// add commands.
const program = new Command();
program
    .name(pkg.name)
    .version(pkg.version)
    .description("Command-line interface for UIGTM application");
// Setup uigtm in remote PC using uigtm project of this PC
program
    .command("setup")
    .description("Setup uigtm in remote computer using uigtm settings of this computer")
    .action((options) => engine.action("setup", options));
// Export uigtm projects on this PC in json format
program
    .command("export")
    .description("Export uigtm projects and it's settings")
    .action((options) => engine.action("export", options));
// Import uigtm projects on this PC
program
    .command("import")
    .description("Import uigtm projects and it's settings")
    .action((options) => engine.action("import", options));
// Remove uigtm projects on this PC
program
    .command("remove")
    .description("Remove specified directories from uigtm projects")
    // .option("-rs, --ref-system <refsystem>", "Reference system path for new UIGTM project")
    .action((options) => engine.action("remove", options));
export function parseProgram() {
    return (program.parse(process.argv));
}
//# sourceMappingURL=commands.js.map