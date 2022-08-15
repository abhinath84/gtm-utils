#!/usr/bin/env node
"use strict";
import { gtm } from "../lib/core/gtm.js";
import { errorHandler } from "../lib/core/errors.js";
// load command api & start parsing them.
gtm
    .load().then(() => {
    // start evaluating commands.
    gtm.parse();
})
    .catch(errorHandler);
//# sourceMappingURL=gtm-cli.js.map