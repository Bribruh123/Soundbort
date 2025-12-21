import fs from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { ReadableStream } from "node:stream/web";
import path from "node:path";

import Logger from "../log.js";

const log = Logger.child({ label: "util => files" });

type DiskSpaceInfo = {
    diskPath: string;
    free: number;
    size: number;
};
type CheckDiskSpace = (path: string) => Promise<DiskSpaceInfo>;

export async function isEnoughDiskSpace(): Promise<boolean> {
    const targetPath = process.platform === "win32"
        ? path.parse(process.cwd()).root
        : "/";

    const module = await import("check-disk-space");
    const checkDiskSpace = (module as { default?: unknown }).default;
    if (typeof checkDiskSpace !== "function") {
        throw new Error("check-disk-space default export is not callable");
    }

    const info = await (checkDiskSpace as CheckDiskSpace)(targetPath);
    const yes = info.free > 1000 * 1000 * 1000;
    if (!yes) log.warn("RUNNING OUT OF DISK SPACE");
    return yes;
}

export async function downloadFile(url: string, out_file: string | URL): Promise<void> {
    type BasicFetch = (input: string | URL, init?: unknown) => Promise<{ ok: boolean; body: ReadableStream<Uint8Array> | null }>;

    const fetchFn = (globalThis as { fetch?: BasicFetch }).fetch;
    if (!fetchFn) throw new Error("Global fetch is not available");

    const res = await fetchFn(url);
    if (!res.ok) throw new Error("Resource not accessible");
    if (!res.body) throw new Error("fetch.Response.body is undefined");

    await pipeline(
        Readable.fromWeb(res.body as ReadableStream<Uint8Array>), // ? unfortunately the ReadableStream implementations don't match
        fs.createWriteStream(out_file),
    );
}
