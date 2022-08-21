"use strict";

import fs from "fs";
import * as fsp from "fs/promises";
import readline from "readline";

import { Utils } from "../utils/utility.js";
// import { ReadFileMiddleware, ReadLineMiddleware, Stream } from "../utils/istream.js";

export interface ReadFileMiddleware {
  (content: string): void;
}

export interface ReadLineMiddleware {
  (content: string, lineno: number): void;
}

type MiddlewareType = "file" | "line";
type ReadMiddlewareMethodType = ReadLineMiddleware | ReadFileMiddleware;

export type ReadMiddleware = {
  content: any;
  type: MiddlewareType;
  method: ReadMiddlewareMethodType;
};

// export type WriteMiddleware = {
//   content: any;
//   type: MiddlewareType;
//   method: WriteMiddlewareMethodType;
// }

export type GTMRead = {
  file: string;
  middleware: ReadMiddleware;
  post: () => void;
};

export type GTMWrite = {
  file: string;
  middleware: (writer: fs.WriteStream) => void;
};

export class GTMStream {
  static read(value: GTMRead): Promise<void> {
    if (value.file.length > 0) {
      Utils.display(`   Reading: ${value.file}`);

      const promise =
        value.middleware.type === "file"
          ? GTMStream.readFile(value.file, <ReadFileMiddleware>value.middleware.method.bind(value.middleware))
          : GTMStream.readLine(value.file, <ReadLineMiddleware>value.middleware.method.bind(value.middleware));

      return promise.then(() => {
        value.post();
        Promise.resolve();
      });
    }

    throw new TypeError("Invalid input in GTMSimulator::read() method");
  }

  static write(value: GTMWrite): Promise<void> {
    Utils.display(`   Writing: ${value.file}`);

    return new Promise((resolve, reject) => {
      // Open file (stream) to write.
      const writer = fs.createWriteStream(value.file);
      writer.setDefaultEncoding("utf-8");

      // WriteStream event handle.
      writer.on("close", resolve);
      writer.on("error", reject);

      // do write into file
      value.middleware(writer);
      writer.close();
    });
  }

  static readFile(filename: string, middleware: ReadFileMiddleware): Promise<void> {
    return fsp.readFile(filename, { encoding: "utf-8" }).then((content: string) => {
      middleware(content);
      Promise.resolve();
    });
  }

  static readLine(filename: string, middleware: ReadLineMiddleware): Promise<void> {
    let lineno = 0;

    return new Promise((resolve, reject) => {
      const rl = readline.createInterface({
        input: fs.createReadStream(filename),
        crlfDelay: Infinity,
      });

      rl.on("line", (line) => {
        lineno += 1;
        middleware(line, lineno);
      });

      rl.on("close", () => {
        lineno = 0;
        resolve();
      });
    });
  }

  static cp(source: string, dest: string): Promise<void> {
    return fsp.cp(source, dest, { force: true, recursive: true });
  }
}
