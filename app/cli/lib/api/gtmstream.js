"use strict";
import fs from "fs";
import * as fsp from "fs/promises";
import readline from "readline";
import { Utils } from "../utils/utility.js";
export class GTMStream {
    static read(value) {
        if (value.file.length > 0) {
            Utils.display(`   Reading: ${value.file}`);
            const promise = value.middleware.type === "file"
                ? GTMStream.readFile(value.file, value.middleware.method.bind(value.middleware))
                : GTMStream.readLine(value.file, value.middleware.method.bind(value.middleware));
            return promise.then(() => {
                value.post();
                Promise.resolve();
            });
        }
        throw new TypeError("Invalid input in GTMSimulator::read() method");
    }
    static write(value) {
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
    static readFile(filename, middleware) {
        return fsp.readFile(filename, { encoding: "utf-8" }).then((content) => {
            middleware(content);
            Promise.resolve();
        });
    }
    static readLine(filename, middleware) {
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
    static cp(source, dest) {
        return fsp.cp(source, dest, { force: true, recursive: true });
    }
}
//# sourceMappingURL=gtmstream.js.map