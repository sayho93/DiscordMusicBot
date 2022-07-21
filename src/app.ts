import {GatewayIntentBits} from 'discord.js'
import Config from '#configs/config'
import DiscordBotClient from '#src/loader/discordBotClient'
import {Log} from '#utils/logger'
import InitApp from '#src/loader/initApp'
import {getWebhookCredentials} from '#utils/utils'

Log.info(`NODE_ENV: ${process.env.NODE_ENV}`)
Log.info(JSON.stringify(process.versions))

await getWebhookCredentials()

const discordBotClient = DiscordBotClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
    ],
})

const startTime = new Date().getTime()
InitApp(discordBotClient).then(async () => {
    Log.debug(`Task took ${Math.round(new Date().getTime() - startTime)} milliseconds`)
    await discordBotClient.client.login(Config.token)
})
