import {Song} from './utils/utils'
import {AudioPlayer, VoiceConnection} from '@discordjs/voice'
import {Client, Collection, StageChannel, VoiceChannel} from 'discord.js'

declare type Song = {
    url: string
    title: string
    duration: string | null
    thumbnail: string
    voiceChannel: VoiceChannel | StageChannel | null | undefined
    video: any
    videoId: string
}

declare type MusicType = {
    queue: Song[]
    isPlaying: Boolean
    volume: number
    player: AudioPlayer | null
}

declare type DiscordBotClientObj = {
    user: any
    commands: Collection<string, any>
    musicData: MusicType
    connection: VoiceConnection | null
    playSong: Function
    client: Client
}
