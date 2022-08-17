"use strict";

import fs from "fs";
import * as fsp from "fs/promises";
import readline from "readline";

export interface ReadFileMiddleware {
  (content: string): void;
}

export interface ReadLineMiddleware {
  (content: string, lineno: number): void;
}

export class Stream {
  static readFile(filename: string, middleware: ReadFileMiddleware): Promise<void> {
    return (fsp.readFile(filename, { encoding: "utf-8" })
      .then((content: string) => {
        middleware(content);
        Promise.resolve();
      })
    );
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
