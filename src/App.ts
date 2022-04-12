import * as fs from 'fs'
import * as discord from 'discord.js'
import {token} from '../config.json'
import {DiscordBotClient} from './structures/DiscordBotClient'
import {Log} from './utils/Logger'

// Log.info(JSON.stringify(process.env))
Log.info(JSON.stringify(process.versions))

const client: DiscordBotClient = new DiscordBotClient({
    intents: [discord.Intents.FLAGS.GUILDS, discord.Intents.FLAGS.GUILD_MEMBERS, discord.Intents.FLAGS.GUILD_MESSAGES, discord.Intents.FLAGS.GUILD_VOICE_STATES],
})
const path: string = process.env.NODE_ENV === 'production' ? 'dist/src' : 'src'

fs.readdirSync(`${path}/commands`).forEach(dirs => {
    const commands: string[] = fs.readdirSync(`${path}/commands/${dirs}`).filter(files => !files.endsWith('.map'))
    commands.forEach(item => {
        const command = require(`./commands/${dirs}/${item}`).default
        Log.debug(`[commands] Loading ${item}`)
        client.commands.set(command.data.name.toLowerCase(), command)
    })
})

fs.readdirSync(`${path}/events`)
    .filter(file => !file.endsWith('.map'))
    .forEach(item => {
        const event = require(`./events/${item}`).default
        Log.debug(`[events] Loading ${event.name}`)
        if (event.once) client.once(event.name, (...args) => event.execute(...args, client))
        else client.on(event.name, (...args) => event.execute(...args, client))
    })

client.login(token).then()
