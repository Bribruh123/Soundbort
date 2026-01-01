import fs from "node:fs";
import { promises as fsPromises } from "node:fs";
import * as http from "node:http";
import * as https from "node:https";
import { pipeline } from "node:stream/promises";
import { URL } from "node:url";

import Logger from "../log.js";

const log = Logger.child({ label: "util => files" });

export async function isEnoughDiskSpace(): Promise<boolean> {
    const root = process.platform === "win32"
        ? `${process.env.SYSTEMDRIVE ?? "C:"}\\`
        : "/";

    try {
        const stats = await fsPromises.statfs(root, { bigint: true });
        const available = stats.bavail * stats.bsize;
        const threshold = 1000n * 1000n * 1000n;
        const hasEnough = available > threshold;

        if (!hasEnough) {
            log.warn(`RUNNING OUT OF DISK SPACE: ${available.toString()} bytes available at ${root}`);
        }

        return hasEnough;
    } catch (error) {
        log.warn("Failed to check disk space", error);
        return true;
    }
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
