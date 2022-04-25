import {Client, ClientOptions, Collection, MessageEmbed} from 'discord.js'
import {AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, joinVoiceChannel, StreamType, VoiceConnection} from '@discordjs/voice'
// import {raw}  from "youtube-dl-exec"
import {Log} from '../utils/Logger'
import ytdl from 'ytdl-core'
import {formatVideo, onError, Song} from '../utils/Utils'
// import {HttpsProxyAgent} from "https-proxy-agent"

export class MusicType {
    constructor() {
        this.queue = []
        this.isPlaying = false
        this.volume = 1
        this.player = null
    }
    public queue: Song[]
    public isPlaying: Boolean
    public volume: number
    public player: AudioPlayer | null
}

export class DiscordBotClient extends Client {
    public commands: Collection<any, any>
    public musicData: MusicType
    public connection: VoiceConnection | null

    constructor(props: ClientOptions) {
        super(props)
        this.commands = new Collection()
        this.musicData = new MusicType()
        this.connection = null
    }

    public async playSong(message: any) {
        if (!this.musicData.queue.length) {
            message.channel.send('No songs in queue')
            return
        }

        if (!this.musicData.queue[0].voiceChannel) {
            message.channel.send('Voice channel info missing')
            return
        }
        this.connection = await joinVoiceChannel({
            channelId: this.musicData.queue[0].voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
        })

        const video = await this.musicData.queue[0].video.fetch()
        const nextSong: Song | null = formatVideo(video, this.musicData.queue[0].voiceChannel)
        if (!nextSong) {
            message.channel.send('Could fetch video')
            return
        }
        this.musicData.queue[0] = nextSong

        let validate = ytdl.validateURL(this.musicData.queue[0].url)
        if (!validate) Log.error('Please input a **valid** URL.')
        const stream = ytdl(this.musicData.queue[0].videoId, {
            filter: 'audioonly',
            quality: 'highestaudio',
            highWaterMark: 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
            liveBuffer: 4000,
        }).on('error', (error: any) => {
            console.log(error)
        })

        const resource: AudioResource = createAudioResource(stream, {inputType: StreamType.Arbitrary})
        const player: AudioPlayer = createAudioPlayer()
        this.musicData.player = player

        try {
            player.play(resource)
            this.connection.subscribe(player)
        } catch (err) {
            Log.error(err)
        }

        player
            .on(AudioPlayerStatus.Playing, () => {
                const currentItem = this.musicData.queue[0]
                if (currentItem !== undefined) {
                    const embed: MessageEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(`:: Currently playing :arrow_forward: ::`)
                        .setDescription(`${currentItem.title} (${currentItem.duration})`)
                        .setURL(currentItem.url)
                        .setThumbnail(currentItem.thumbnail)
                    message.channel.send({embeds: [embed]})
                    Log.info(`Currently playing ${currentItem.title}`)
                }
            })
            .on(AudioPlayerStatus.Idle, () => {
                if (this.musicData.queue.length > 1) {
                    Log.debug('queue length is not zero')
                    this.musicData.queue.shift()
                    return this.playSong(message)
                } else {
                    Log.debug('queue empty')
                    this.musicData.isPlaying = false
                    setTimeout(() => {
                        if (this.musicData.queue.length <= 1 && !this.musicData.isPlaying) {
                            this.musicData = new MusicType()
                            message.channel.send(`Disconnected from channel due to inactivity`)
                            if (this.connection !== null) this.connection.destroy()
                        }
                    }, 180000)
                }
            })
            .on('error', err => {
                Log.error('error occurred')
                this.musicData.isPlaying = false
                if (err.message === 'Status code: 410') {
                    message.channel.send(`Unplayable Song: ${message.client.musicData.queue[0].title}`)
                    return
                } else {
                    message.channel.send('error occurred')
                    onError(err, message)
                    if (this.connection !== null) return this.connection.destroy()
                }
            })
    }
}
