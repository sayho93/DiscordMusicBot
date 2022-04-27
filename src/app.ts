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

const startTime = performance.now()
const init = async () => {
    let commandDirs
    let events
    const jobs = []

    await Promise.all([(commandDirs = await fs.readdir(`${path}/commands`)), (events = await fs.readdir(`${path}/events`))])

    const readCommandDirs = commandDirs.map(async (dir: string) => {
        let commands: string[] = await fs.readdir(`${path}/commands/${dir}`)

        const readCommands = commands
            .filter(files => !files.endsWith('.map'))
            .map(async item => {
                let command = await import(`./commands/${dir}/${item}`)
                command = command.default
                Log.debug(`[commands] Loading ${item}`)
                discordBotClient.commands.set(command.data.name.toLowerCase(), command)
            })
        jobs.push(...readCommands)
    })

    const readEvents = events
        .filter(file => !file.endsWith('.map'))
        .map(async file => {
            let event = await import(`./events/${file}`)
            event = event.default
            Log.debug(`[events] Loading ${event.name}`)
            if (event.once) discordBotClient.client.once(event.name, (...args: any) => event.execute(...args, discordBotClient))
            else discordBotClient.client.on(event.name, (...args: any) => event.execute(...args, discordBotClient))
        })

    jobs.push(...readEvents)
    await Promise.all(readCommandDirs)
    await Promise.all(jobs)
}

init().then(() => {
    Log.debug(`Task took ${Math.round(performance.now() - startTime)} milliseconds`)
    discordBotClient.client.login(Config.token).then()
})
