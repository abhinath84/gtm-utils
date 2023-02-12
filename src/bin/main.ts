#!/usr/bin/env node

"use strict";

import { engine } from "../lib/core/engine.js";
import { errorHandler } from "../lib/core/errors.js";

// load command api & start parsing them.
engine
  .load().then(() => {
    // start evaluating commands.
    engine.parse();
  })
  .catch(errorHandler);
