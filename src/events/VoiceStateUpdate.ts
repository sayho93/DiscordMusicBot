import {VoiceState} from "discord.js"
import {DiscordBotClient} from "../structures/DiscordBotClient"
import {Log} from '../utils/Logger'

const VoiceStateUpdate = {
    name: 'voiceStateUpdate',
    execute: async  (oldState: VoiceState, newState: VoiceState, client: DiscordBotClient) => {
        if (oldState.channelId !== (oldState.guild.me?.voice.channelId || newState.channel)) return
        if (!((oldState.channel?.members.size ?? 1) - 1)) {
            Log.info('start')
            setTimeout(() => {
                if (!((oldState.channel?.members.size ?? 1) - 1)) {
                    const channel: any = oldState.client.channels.cache.filter((channel: any) => channel.name === '일반').first()
                    // channel.send('Disconnected from channel due to inactivity')
                    channel.send('바윙~')
                    client.connection?.destroy()
                }
            }, 5000)
            // 180000
        }
    }
}

export default VoiceStateUpdate