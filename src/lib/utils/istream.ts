"use strict";

import fs from "fs";
import * as fsp from "fs/promises";
import readline from "readline";

export interface ReadLineMiddleware {
  (content: string, lineno: number): void;
}

export class Stream {
  // private mFilename: string;

  private mLineno: number;

  constructor(filename: string) {
    // this.mFilename = filename;
    this.mLineno = 0;
  }

  static readLine(filename: string, middleware: ReadLineMiddleware): Promise<void> {
    let lineno = 0;

    return (new Promise((resolve, reject) => {
      const rl = readline.createInterface({
        input: fs.createReadStream(filename),
        crlfDelay: Infinity
      });

      rl.on("line", (line) => {
        lineno += 1;
        middleware(line, lineno);
      });

      rl.on("close", () => {
        lineno = 0;
        resolve();
      });
    }));
  }

  static cp(source: string, dest: string): Promise<void> {
    return (fsp.cp(source, dest, { force: true, recursive: true }));
  }
}
