import fs from 'fs/promises'
import {Log} from '#utils/logger'
import {DiscordBotClient} from '#root/src'
import * as Path from 'path'

const InitApp = async (discordBotClient: DiscordBotClient) => {
    const path: string = process.env.NODE_ENV === 'production' ? 'src' : 'src'
    let commandDirs: string[]
    let events: string[]
    await Promise.allSettled([(commandDirs = await fs.readdir(`${path}/commands`)), (events = await fs.readdir(`${path}/events`))])

    const concurrentJobs: Function[] = []
    let commands: string[] = []

    commandDirs.forEach(dir => {
        concurrentJobs.push(async () => {
            const files: string[] = await fs.readdir(`${path}/commands/${dir}`)
            files.forEach(file => {
                commands.push(Path.resolve(`${path}/commands/${dir}/${file}`))
            })
            Log.verbose(`${dir} commands loaded`)
        })
    })

    events
        .filter(file => !file.endsWith('.map'))
        .forEach(file => {
            concurrentJobs.push(async () => {
                try {
                    let event = await import(Path.resolve(`${path}/events/${file}`))
                    event = event.default
                    Log.debug(`[events] Loading ${event.name}`)
                    if (event.once) discordBotClient.client.once(event.name, (...args: any) => event.execute(...args, discordBotClient))
                    else discordBotClient.client.on(event.name, (...args: any) => event.execute(...args, discordBotClient))
                } catch (error) {
                    Log.error(`[events] Failed to load ${path}/events/${file}`)
                    Log.error(error)
                }
            })
        })

    await Promise.allSettled(concurrentJobs.map(job => job()))

    await Promise.allSettled(
        commands
            .filter(file => !file.endsWith('.map'))
            .map(async (file: string) => {
                try {
                    let command = await import(file)
                    command = command.default
                    Log.debug(`[commands] Loading ${file.split('/').pop()?.replace(/\..+/, '')}`)
                    discordBotClient.commands.set(command.data.name.toLowerCase(), command)
                } catch (error) {
                    Log.error(`[commands] Failed to load ${file}`)
                    Log.error(error)
                }
            })
    )
}

export default InitApp
