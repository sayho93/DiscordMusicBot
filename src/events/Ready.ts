import {Log} from '../utils/Logger'
import {DiscordBotClient} from "../structures/DiscordBotClient";

const Ready = {
    name: 'ready',
    once: true,
    execute(client: DiscordBotClient) {
        Log.verbose(`SayhoBot server ready`)
        Log.verbose(`Logged in as ${client.user?.tag}`)
    },
}

export default Ready
