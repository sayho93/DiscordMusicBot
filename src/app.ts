import * as fs from 'fs/promises'
import * as discord from 'discord.js'
import Config from '#configs/config'
import DiscordBotClient from '#structures/discordBotClient'
import {Log} from '#utils/logger'

// Log.info(JSON.stringify(process.env))
Log.info(JSON.stringify(process.versions))

const discordBotClient = DiscordBotClient({
    intents: [discord.Intents.FLAGS.GUILDS, discord.Intents.FLAGS.GUILD_MEMBERS, discord.Intents.FLAGS.GUILD_MESSAGES, discord.Intents.FLAGS.GUILD_VOICE_STATES],
})
const path: string = process.env.NODE_ENV === 'production' ? 'dist/src' : 'src'

const init = async () => {
    let commandDirs: string[]
    let events: string[]
    await Promise.allSettled([(commandDirs = await fs.readdir(`${path}/commands`)), (events = await fs.readdir(`${path}/events`))])

    const concurrentJobs: Function[] = []
    let commands: string[] = []

    commandDirs.forEach(dir => {
        concurrentJobs.push(async () => {
            const files = await fs.readdir(`${path}/commands/${dir}`)
            files.forEach(file => {
                commands.push(`./commands/${dir}/${file}`)
            })
            Log.verbose(`${dir} commands loaded`)
        })
    })

    events
        .filter(file => !file.endsWith('.map'))
        .forEach(file => {
            concurrentJobs.push(async () => {
                try {
                    let event = await import(`./events/${file}`)
                    event = event.default
                    Log.debug(`[events] Loading ${event.name}`)
                    if (event.once) discordBotClient.client.once(event.name, (...args: any) => event.execute(...args, discordBotClient))
                    else discordBotClient.client.on(event.name, (...args: any) => event.execute(...args, discordBotClient))
                } catch (error) {
                    Log.error(`[events] Failed to load ${file}`)
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
                    Log.debug(`[commands] Loading ${file}`)
                    discordBotClient.commands.set(command.data.name.toLowerCase(), command)
                } catch (error) {
                    Log.error(`[commands] Failed to load ${file}`)
                    Log.error(error)
                }
            })
    )
}

const startTime = performance.now()
init().then(() => {
    Log.debug(`Task took ${Math.round(performance.now() - startTime)} milliseconds`)
    discordBotClient.client.login(Config.token).then()
})
