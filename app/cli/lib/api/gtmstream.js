"use strict";
import fs from "fs";
// import * as fsp from "fs/promises";
import { Utils } from "../utils/utility.js";
import { Stream } from "../utils/istream.js";
export class GTMStream {
    static read(value) {
        if (value.file.length > 0) {
            Utils.display(`   Reading: ${value.file}`);
            const promise = (value.middleware.type === "file")
                ? Stream.readFile(value.file, value.middleware.method.bind(value.middleware))
                : Stream.readLine(value.file, value.middleware.method.bind(value.middleware));
            return (promise.then(() => {
                value.post();
                Promise.resolve();
            }));
        }
        throw new TypeError("Invalid input in GTMSimulator::read() method");
    }
    static write(value) {
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
//# sourceMappingURL=gtmstream.js.map