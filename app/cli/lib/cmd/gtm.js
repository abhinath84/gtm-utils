"use strict";
import { UIGTMSupport } from "../api/uigtm.js";
import { UsageError } from "../core/errors.js";
import { Utils } from "../utils/utility.js";
function validateOption(option) {
    const msgs = [];
    // check params
    if (option.new && option.update) {
        msgs.push("Please provide (-n, --new) or (-u, --update), not both of them.");
    }
    // check if both new & update present
    if (!option.new && !option.update) {
        msgs.push("(-n, --new) or (-u, --update) is a mandatory option. Please provide any of them.");
    }
    return (msgs);
}
const api = (option) => (new Promise((resolve, reject) => {
    const refSystem = option.refSystem || Utils.getEnv("GTM_REF_SYSTEM") || "";
    if (option.new) {
        UIGTMSupport.createProject(option.new, refSystem)
            .then((response) => {
            console.log(response);
            resolve(response);
        })
            .catch(reject);
    }
    else if (option.update) {
        UIGTMSupport.updateProject(option.update, refSystem)
            .then((response) => resolve(response))
            .catch(reject);
    }
    else {
        reject(new UsageError("Usage: csunit gtm [-n <projname>] [-u <projname>]"));
    }
}));
const cli = (option) => (new Promise((resolve, reject) => {
    // validate command options
    const errors = validateOption(option);
    if (errors.length > 0) {
        reject(new UsageError(`${errors.join("\n")}

${Utils.cmdUsageHelpMsg("gtm")}`));
    }
    // call 'run' api.
    api(option)
        .then((response) => {
        console.log(response);
        resolve(response);
    })
        .catch(reject);
}));
export { api, cli };
//# sourceMappingURL=gtm.js.map