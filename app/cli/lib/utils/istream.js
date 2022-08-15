"use strict";
import fs from "fs";
import * as fsp from "fs/promises";
import readline from "readline";
export class Stream {
    constructor(filename) {
        // this.mFilename = filename;
        this.mLineno = 0;
    }
    static readLine(filename, middleware) {
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
    static cp(source, dest) {
        return (fsp.cp(source, dest, { force: true, recursive: true }));
    }
}
//# sourceMappingURL=istream.js.map