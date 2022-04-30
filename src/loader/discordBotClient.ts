import {Client, ClientOptions, Collection, MessageEmbed} from 'discord.js'
import {AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, joinVoiceChannel, StreamType, VoiceConnection} from '@discordjs/voice'
import {Log} from '#utils/logger'
import ytdl from 'ytdl-core'
import {formatVideo, onError} from '#utils/utils'
import {DiscordBotClient, MusicData, Song} from '#root/src'

const DiscordBotClient = (props: ClientOptions): DiscordBotClient => {
    let user = null
    const client: Client = new Client(props)
    const commands: Collection<string, any> = new Collection()
    let musicData: MusicData = {
        queue: [],
        isPlaying: false,
        volume: 1,
        player: null,
    }
    let connection: VoiceConnection | null = null

    const createPlayer = async (message: any) => {
        const player: AudioPlayer = createAudioPlayer()

        player
            .on(AudioPlayerStatus.Playing, () => {
                const currentItem = musicData.queue[0]
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
            .on(AudioPlayerStatus.Idle, async () => {
                if (musicData.queue.length > 1) {
                    Log.debug('queue length is not zero')
                    musicData.queue.shift()
                    await playSong(message.channel)
                    return
                }

                Log.debug('queue empty')
                musicData.isPlaying = false
                setTimeout(() => {
                    if (musicData.queue.length <= 1 && !musicData.isPlaying) {
                        musicData = {
                            queue: [],
                            isPlaying: false,
                            volume: 1,
                            player: null,
                        }
                        message.channel.send(`Disconnected from channel due to inactivity`)
                        connection?.destroy()
                        connection = null
                    }
                }, 180000)
            })
            .on('error', err => {
                Log.error('error occurred')
                musicData.isPlaying = false
                if (err.message === 'Status code: 410') {
                    message.channel.send(`Unplayable Song: ${message.client.musicData.queue[0].title}`)
                    return
                }
                message.channel.send('error occurred')
                onError(err, message)
                connection?.destroy()
                connection = null
            })
        return player
    }

    const playSong = async (message: any) => {
        if (!musicData.queue.length) {
            message.channel.send('No songs in queue')
            return
        }

        const video = await musicData.queue[0].video.fetch()
        const nextSong: Song | null = formatVideo(video, musicData.queue[0].voiceChannel)
        if (!nextSong) {
            message.channel.send('Could fetch video')
            return
        }
        musicData.queue[0] = nextSong

        let validate = ytdl.validateURL(musicData.queue[0].url)
        if (!validate) {
            Log.error('Please input a **valid** URL.')
            await message.reply('Please input a **valid** URL.')
        }
        const stream = ytdl(musicData.queue[0].videoId, {
            filter: 'audioonly',
            quality: 'highestaudio',
            highWaterMark: 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
            liveBuffer: 4000,
        }).on('error', (error: any) => {
            message.reply(error)
            Log.error(error)
        })

        const resource: AudioResource = createAudioResource(stream, {inputType: StreamType.Arbitrary})
        if (!connection) {
            connection = joinVoiceChannel({
                channelId: musicData.queue[0].voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            })
        }
        if (!musicData.player) musicData.player = await createPlayer(message)

        try {
            musicData.player.play(resource)
            connection.subscribe(musicData.player)
        } catch (err) {
            Log.error(err)
            message.channel.send('Error occurred on player.play()')
            message.channel.send(err)
        }
    }

    return {
        commands,
        setConnection: (conn: VoiceConnection | null) => {
            connection = conn
        },
        getConnection: () => connection,
        setMusicData: (data: MusicData) => {
            musicData = data
        },
        getMusicData: () => musicData,
        playSong,
        client,
        user,
    }
}

export default DiscordBotClient
