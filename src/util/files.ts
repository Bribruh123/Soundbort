import fs from "node:fs";
import * as http from "node:http";
import * as https from "node:https";
import { pipeline } from "node:stream/promises";
import { URL } from "node:url";
import disk from "diskusage";

import Logger from "../log.js";

const log = Logger.child({ label: "util => files" });

export async function isEnoughDiskSpace(): Promise<boolean> {
    const info = await disk.check("/");
    const yes = info.available > 1000 * 1000 * 1000;
    if (!yes) log.warn("RUNNING OUT OF DISK SPACE");
    return yes;
}

export async function downloadFile(url: string, out_file: string | URL): Promise<void> {
    const target = new URL(url);

    const getResponse = async (current: URL, redirects = 0): Promise<http.IncomingMessage> => {
        if (redirects > 5) throw new Error("Too many redirects while downloading file");

        const handler = current.protocol === "http:" ? http : https;

        return await new Promise<http.IncomingMessage>((resolve, reject) => {
            const request = handler.get(current, res => {
                const status = res.statusCode ?? 0;

                if (status >= 300 && status < 400 && res.headers.location) {
                    res.resume();
                    const nextUrl = new URL(res.headers.location, current);
                    getResponse(nextUrl, redirects + 1).then(resolve, reject);
                    return;
                }

                if (status < 200 || status >= 300) {
                    res.resume();
                    reject(new Error(`Failed to download file. HTTP status: ${status}`));
                    return;
                }

                resolve(res);
            });

            request.on("error", reject);
        });
    };

    const response = await getResponse(target);

    await pipeline(
        response,
        fs.createWriteStream(out_file),
    );
}
