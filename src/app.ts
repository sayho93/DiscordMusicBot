import * as discord from 'discord.js'
import Config from '#configs/config'
import DiscordBotClient from '#src/loader/discordBotClient'
import {Log} from '#utils/logger'
import InitApp from '#src/loader/initApp'

Log.info(`NODE_ENV: ${process.env.NODE_ENV}`)
Log.info(JSON.stringify(process.versions))

const discordBotClient = DiscordBotClient({
    intents: [discord.Intents.FLAGS.GUILDS, discord.Intents.FLAGS.GUILD_MEMBERS, discord.Intents.FLAGS.GUILD_MESSAGES, discord.Intents.FLAGS.GUILD_VOICE_STATES],
})

const startTime = new Date().getTime()
InitApp(discordBotClient).then(async () => {
    Log.debug(`Task took ${Math.round(new Date().getTime() - startTime)} milliseconds`)
    await discordBotClient.client.login(Config.token)
})
