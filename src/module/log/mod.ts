import * as log from "jsr:@std/log";

export function init() {
    log.setup({
        handlers: {
            console: new log.ConsoleHandler("DEBUG", {
                useColors: true,
            }),
            jsonStdout: new log.ConsoleHandler("DEBUG", {
                formatter: log.formatters.jsonFormatter,
                useColors: false,
            }),
            customSample: new log.ConsoleHandler("DEBUG", {
                formatter: (record) =>
                    `[${record.datetime.toISOString()}][${record.loggerName}:${record.levelName}]:${record.msg}`,
                useColors: true,
            }),
        },
        loggers: {
            default: {
                level: "DEBUG",
                handlers: ["console"],
            },
            json: {
                level: "DEBUG",
                handlers: ["jsonStdout"],
            },
            storage: {
                level: "DEBUG",
                handlers: ["console", "jsonStdout", "customSample"],
            },
        },
    });
}
