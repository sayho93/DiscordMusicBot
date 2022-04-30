import {AudioPlayer, VoiceConnection} from '@discordjs/voice'
import {Client, Collection, StageChannel, VoiceChannel} from 'discord.js'

declare type Song = {
    url: string
    title: string
    duration: string | null
    thumbnail: string
    voiceChannel: VoiceChannel | StageChannel
    video: any
    videoId: string
}

declare type MusicData = {
    queue: Song[]
    isPlaying: Boolean
    volume: number
    player: AudioPlayer | null
}

declare type DiscordBotClient = {
    user: any
    commands: Collection<string, any>
    connection: VoiceConnection | null
    getConnection: Function
    musicData: MusicData
    getMusicData: Function
    playSong: Function
    client: Client
}
