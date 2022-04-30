import {Log} from '#utils/logger'
import {DiscordBotClient} from '#root/src'

export default {
    name: 'ready',
    once: true,
    execute: (discordBotClient: DiscordBotClient) => {
        Log.verbose(`Logged in as ${discordBotClient.user?.tag}`)
        Log.verbose(`SayhoBot server ready`)
    },
}
