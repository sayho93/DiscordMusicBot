import {VoiceState} from 'discord.js'
import {Log} from '#utils/logger'
import {DiscordBotClient} from '#root/src'

export default {
    name: 'voiceStateUpdate',
    execute: async (oldState: VoiceState, newState: VoiceState, client: DiscordBotClient) => {
        if (oldState.channelId !== (oldState.guild.members.me?.voice.channelId || newState.channel)) return

        if (!((oldState.channel?.members.size ?? 1) - 1)) {
            Log.info('start')

            setTimeout(() => {
                if (!((oldState.channel?.members.size ?? 1) - 1)) {
                    const channel: any = oldState.client.channels.cache.filter((channel: any) => channel.name === '일반').first()
                    client.setMusicData({
                        queue: [],
                        isPlaying: false,
                        volume: 1,
                        player: null,
                    })
                    channel.send('바윙~')
                    client.getConnection()?.destroy()
                    client.setConnection(null)
                }
            }, 5000)
            // 180000
        }
    },
}
