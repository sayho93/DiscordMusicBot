import winston from 'winston'
import winstonDaily from 'winston-daily-rotate-file'
import * as fs from 'fs'
import {TransformableInfo} from 'logform'

const logDir = 'logs' // logs 디렉토리 하위에 로그 파일 저장
const {combine, timestamp, printf, label} = winston.format

// Define log format
const logFormat = printf((info: TransformableInfo) => {
    return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`
})

/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir)

const options = {
    file: {
        level: 'silly',
        format: combine(
            timestamp({
                format: 'YYYY-MM-DD HH:mm:ss',
            }),
            label({label: 'SayhoBot'}),
            logFormat,
            winston.format.errors({stack: true}),
            winston.format.colorize()
        ),
        transports: [
            new winstonDaily({
                datePattern: 'YYYY-MM-DD',
                dirname: logDir,
                filename: `%DATE%.log`,
                maxFiles: 30, // 30일치 로그 파일 저장
                zippedArchive: true,
            }),
        ],
    },
    console: {
        level: 'silly',
        format: combine(
            timestamp({
                format: 'YYYY-MM-DD HH:mm:ss',
            }),
            label({label: 'SayhoBot'}),
            logFormat,
            winston.format.errors(),
            winston.format.colorize()
        ),
        transports: [],
    },
}

export const Log = winston.createLogger(options.file).add(new winston.transports.Console(options.console))
const stream = {
    write: (message: string) => {
        Log.http(message.substring(0, message.lastIndexOf('\n')))
    },
}
export default {Log, stream}
