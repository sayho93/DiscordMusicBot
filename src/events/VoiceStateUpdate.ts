import {VoiceState} from "discord.js"
import {DiscordBotClient, MusicType} from "../structures/DiscordBotClient"
import {Log} from '../utils/Logger'

export default {
    name: 'voiceStateUpdate',
    execute: async (oldState: VoiceState, newState: VoiceState, client: DiscordBotClient) => {
        if (oldState.channelId !== (oldState.guild.me?.voice.channelId || newState.channel)) return
        if (!((oldState.channel?.members.size ?? 1) - 1)) {
            Log.info('start')
            setTimeout(() => {
                if (!((oldState.channel?.members.size ?? 1) - 1)){
                    const channel: any = oldState.client.channels.cache.filter((channel: any) => channel.name === '일반').first()
                    client.musicData = new MusicType()
                    channel.send('바윙~')
                    client.connection?.destroy()
                }
            }, 5000)
            // 180000
        }
    }
}