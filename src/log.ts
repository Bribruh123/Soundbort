// eslint-disable-next-line unicorn/import-style
import chalk, { Color, Modifiers } from "chalk";
import winston from "winston";
import "winston-daily-rotate-file";

import { ENVIRONMENT, EnvironmentStages, LOGS_DIR } from "./config";

export const levels = {
    error: 0,
    warn: 1,
    info: 2,
    verbose: 3,
    debug: 4,
};

declare type ChalkKeywords = typeof Color | typeof Modifiers;

interface ChalkColorLookup {
    [level: string]: ChalkKeywords[] | undefined;
}

export const colors: ChalkColorLookup = {
    error: ["bold", "bgRed", "white"],
    warn: ["yellow"],
    info: ["green"],
    verbose: ["magenta"],
    debug: ["white"],
};

const rotate_file_opts = {
    datePattern: "YYYY-MM-DD",
    zippedArchive: false,
    maxSize: "20m",
    maxFiles: "30d",
    json: true,
};

const Logger = winston.createLogger({
    levels,
    level: "debug",
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json(),
    ),
    transports: [
        new winston.transports.DailyRotateFile({
            ...rotate_file_opts,
            filename: `${LOGS_DIR}/%DATE%-bot-error.log`,
            level: "error",
        }),
        new winston.transports.DailyRotateFile({
            ...rotate_file_opts,
            filename: `${LOGS_DIR}/%DATE%-bot-combined.log`,
        }),
    ],
});

/*
 * Simple helper for stringifying all remaining
 * properties.
 */
function rest(info: any): string {
    return JSON.stringify({
        ...info,
        timestamp: undefined,
        shard: undefined,
        label: undefined,
        level: undefined,
        message: undefined,
        stack: undefined,
    }, null, 2);
}

function colorize(lookup: string, message?: string): string | undefined {
    if (typeof message === "undefined") {
        return message;
    }

    const lookup_color = colors[lookup];
    if (!lookup_color) {
        return message;
    }

    // iterate over each item in the list and add ontop of the items before
    let state: chalk.Chalk | undefined;
    for (let i = 0, len = lookup_color.length; i < len; i++) {
        try {
            state = (state || chalk)[lookup_color[i]];
        } catch (error) { error; }
    }

    return state ? state(message) : message;
}

export function printf(info: any): string {
    let str = `${info.timestamp} > `;

    if (typeof info.shard !== "undefined") {
        str += chalk.magenta(`[shard:${info.shard}] `);
    }
    if (info.label) {
        str += chalk.cyan(`[${info.label}] `);
    }

    str += colorize(info.level, `${info.level}: ${info.message} `);

    // error logging
    if (info.stack) {
        str += `\n ${chalk.bold.red(info.stack)} `;
    }

    return str + rest(info);
}

if (ENVIRONMENT !== EnvironmentStages.PROD) {
    Logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.printf(printf),
        ),
    }));
}

export default Logger;
