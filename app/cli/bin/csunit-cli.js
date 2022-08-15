#!/usr/bin/env node
"use strict";
import { csunit } from "../lib/core/csunit.js";
import { errorHandler } from "../lib/core/errors.js";
// load command api & start parsing them.
csunit
    .load().then(() => {
    // start evaluating commands.
    csunit.parse();
})
    .catch(errorHandler);
//# sourceMappingURL=csunit-cli.js.map