import {Log} from '../utils/Logger'
import {DiscordBotClient} from "../structures/DiscordBotClient"

export default {
    name: 'ready',
    once: true,
    execute: (client: DiscordBotClient) => {
        Log.verbose(`SayhoBot server ready`)
        Log.verbose(`Logged in as ${client.user?.tag}`)
    },
}
