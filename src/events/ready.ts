import {Log} from '#utils/logger'
import {DiscordBotClientObj} from '#root/src'

export default {
    name: 'ready',
    once: true,
    execute: (discordBotClient: DiscordBotClientObj) => {
        Log.verbose(`SayhoBot server ready`)
        Log.verbose(`Logged in as ${discordBotClient.user?.tag}`)
    },
}
