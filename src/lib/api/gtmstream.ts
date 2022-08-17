"use strict";

import path from "path";
import fs from "fs";
// import * as fsp from "fs/promises";

import { Utils } from "../utils/utility.js";
import { ReadFileMiddleware, ReadLineMiddleware, Stream } from "../utils/istream.js";
import { UsageError } from "../core/errors.js";

type MiddlewareType = "file" | "line";
type ReadMiddlewareMethodType = ReadLineMiddleware | ReadFileMiddleware;
type WriteMiddlewareMethodType = string;

export type ReadMiddleware = {
  content: any;
  type: MiddlewareType;
  method: ReadMiddlewareMethodType;
}

// export type WriteMiddleware = {
//   content: any;
//   type: MiddlewareType;
//   method: WriteMiddlewareMethodType;
// }

export type GTMRead = {
  file: string;
  middleware: ReadMiddleware;
  post: () => void;
}

export type GTMWrite = {
  file: string;
  middleware: (writer: fs.WriteStream) => void;
}

export class GTMStream {
  static read(value: GTMRead): Promise<void> {
    if (value.file.length > 0) {
      Utils.display(`   Reading: ${value.file}`);

      const promise = (value.middleware.type === "file")
        ? Stream.readFile(value.file, <ReadFileMiddleware>value.middleware.method.bind(value.middleware))
        : Stream.readLine(value.file, <ReadLineMiddleware>value.middleware.method.bind(value.middleware));

      return (promise.then(() => {
        value.post();
        Promise.resolve();
      }));
    }

    throw new TypeError("Invalid input in GTMSimulator::read() method");
  }

  static write(value: GTMWrite): Promise<void> {
    Utils.display(`   Writing: ${value.file}`);

    return (new Promise((resolve, reject) => {
      // Open file (stream) to write.
      const writer = fs.createWriteStream(value.file);
      writer.setDefaultEncoding("utf-8");

      // WriteStream event handle.
      writer.on("close", resolve);
      writer.on("error", reject);

      // do write into file
      value.middleware(writer);
      writer.close();
    }));
  }
}
