import * as fs from "fs"
import * as discord from 'discord.js'
import {token} from '../config.json'
import {DiscordBotClient} from "./structures/DiscordBotClient"
import {Log} from './utils/Logger'


Log.info(JSON.stringify(process.env))
Log.info(process.version)
Log.info(JSON.stringify(process.versions))

const client: DiscordBotClient = new DiscordBotClient({intents: [discord.Intents.FLAGS.GUILDS, discord.Intents.FLAGS.GUILD_MESSAGES, discord.Intents.FLAGS.GUILD_VOICE_STATES]})

fs.readdirSync('src/commands').forEach(dirs => {
    const commands = fs.readdirSync(`src/commands/${dirs}`).filter(files => files.endsWith('.js'))
    commands.forEach(item => {
        const command = require(`./commands/${dirs}/${item}`)
        Log.debug(`[commands] Loading ${item}`)
        client.commands.set(command.data.name.toLowerCase(), command)
    })
})

fs.readdirSync('src/events').filter(file => file.endsWith('.js')).forEach(item => {
    const event = require(`./events/${item}`)
    Log.debug(`[events] Loading ${event.name}`)
    if(event.once) client.once(event.name, (...args) => event.execute(...args))
    else client.on(event.name, (...args) => event.execute(...args))
})

client.login(token).then()
