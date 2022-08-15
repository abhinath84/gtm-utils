"use strict";
import log from "npmlog";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pkg = require("../../../../package.json");
class UsageError extends Error {
    constructor(message) {
        super(message);
        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
        // This clips the constructor invocation from the stack trace.
        // It's not absolutely essential, but it does make the stack trace a little nicer.
        //  @see Node.js reference (bottom)
        Error.captureStackTrace(this, this.constructor);
    }
}
function errorHandler(err) {
    if (!err) {
        process.exit(1); // ???
    }
    if (err instanceof UsageError) {
        log.error("" /* err.name */, err.message);
        process.exit(1);
    }
    // err.message && log.error(err.message);
    if (err.stack) {
        log.error("", err.stack);
        log.error("", "");
        log.error("", "");
        log.error("", `${pkg.name}: `, pkg.version, "node:", process.version);
        log.error("", `please open an issue including this log on ${pkg.bugs.url}`);
    }
    else {
        log.error("", err.message);
    }
    process.exit(1);
}
export { UsageError, errorHandler };
//# sourceMappingURL=errors.js.map