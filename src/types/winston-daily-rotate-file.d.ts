declare module "winston-daily-rotate-file/daily-rotate-file.js" {
    import TransportStream from "winston-transport";
    import type { TransformableInfo } from "logform";

    export interface DailyRotateFileTransportOptions {
        filename?: string;
        dirname?: string;
        datePattern?: string;
        zippedArchive?: boolean;
        maxSize?: string | number;
        maxFiles?: string | number;
        json?: boolean;
        level?: string;
        auditFile?: string;
        frequency?: string;
        createSymlink?: boolean;
        symlinkName?: string;
        watchLog?: boolean;
        utc?: boolean;
        extension?: string;
        auditHashType?: string;
        stream?: NodeJS.WritableStream;
        options?: { flags?: string };
    }

    export default class DailyRotateFile extends TransportStream {
        constructor(options?: DailyRotateFileTransportOptions);
        log(info: TransformableInfo, callback: () => void): void;
        close(): void;
    }
}
