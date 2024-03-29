import {SlashCommandBuilder} from '@discordjs/builders'
import {VoiceChannel, StageChannel} from 'discord.js'
import {dispatchErrorLog, formatMessageEmbed, formatVideo} from '#utils/utils'
import Config from '#configs/config'
import {Log} from '#utils/logger'
import {Message} from 'discord.js'
import {DiscordBotClient, MusicData, Song} from '#root/src'
// @ts-ignore
import Youtube from 'simple-youtube-api'
import {PermissionFlagsBits} from 'discord-api-types/v10'

const Play = () => {
    const data = new SlashCommandBuilder().setName('p').setDescription('Plays music with uri')
    const youtube = new Youtube(Config.youtubeAPI)

    const playlistHandler = async (url: string, voiceChannel: VoiceChannel | StageChannel, client: DiscordBotClient, message: Message) => {
        Log.info('Playlist detected')
        const musicData = client.getMusicData()
        try {
            const playlist = await youtube.getPlaylist(url)
            const videosObj = await playlist.getVideos()
            if (!videosObj.length) {
                return message.channel.send('No videos found')
            }

            let thumb
            for (const [idx, item] of videosObj.entries()) {
                if (item.raw.status.privacyStatus === 'private') continue

                if (idx === 0) thumb = item.thumbnails.high.url
                const song: Song | null = formatVideo(item, voiceChannel)
                if (song) musicData.queue.push(song)
            }

            const queue = musicData.queue
            Log.info(`queue length: ${queue.length}`)
            Log.info(`next: ${JSON.stringify(queue[0].title)}`)

            await message.reply({embeds: [formatMessageEmbed(url, videosObj.length, queue.length, playlist.title, thumb)]})

            if (!musicData.isPlaying) {
                musicData.isPlaying = true
                return client.playSong(message)
            }
        } catch (err) {
            await dispatchErrorLog(err)
            return message.reply('Playlist is either private or it does not exist')
        }
    }

    const singleVidHandler = async (url: string, voiceChannel: VoiceChannel | StageChannel, client: DiscordBotClient, message: Message) => {
        Log.info('Single video/song detected')
        const musicData = client.getMusicData()
        try {
            const video = await youtube.getVideo(url)
            const song: Song | null = formatVideo(video, voiceChannel)
            if (!song) return message.reply('Video is either private or it does not exist')
            musicData.queue.push(song)

            const queue = musicData.queue
            Log.info(`Queue length: ${queue.length}`)
            Log.info(`Current: ${JSON.stringify(queue[0].title)}`)

            await message.reply({embeds: [formatMessageEmbed(url, 1, queue.length, song.title, song.thumbnail)]})

            if (!musicData.isPlaying) {
                musicData.isPlaying = true
                return client.playSong(message)
            }
        } catch (err) {
            await dispatchErrorLog(err)
        }
    }

    const searchHandler = async (args: string[], message: Message) => {
        Log.info('Search detected')
        try {
            let searchTxt = ''
            args.forEach((item, idx) => {
                if (idx !== 0) searchTxt += `${item} `
            })

            searchTxt = searchTxt.trim()
            Log.debug(`searchTxt: ${searchTxt}`)
            const results = await youtube.searchVideos(searchTxt, 10)

            type ListItem = {
                label: string
                description: string
                value: string
            }
            const list: ListItem[] = results.flatMap((item: any): ListItem[] => {
                const url = `https://www.youtube.com/watch?v=${item.id}`
                const title = item.raw.snippet.title
                if (title.length >= 100) return []
                return [{label: title, description: title, value: url}]
            })

            await message.reply({
                content: `'${searchTxt}' 검색 결과`,
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 3,
                                custom_id: 'select',
                                options: list,
                                placeholder: '재생할 노래 선택',
                                max_values: 1,
                            },
                        ],
                    },
                ],
            })
        } catch (err) {
            await dispatchErrorLog(err)
        }
    }

    const execute = async (message: Message, client: DiscordBotClient) => {
        const musicData: MusicData = client.getMusicData()

        const args: string[] = message.content.slice(Config.prefix.length).trim().split(/ +/g)
        if (args.length < 2) {
            await message.reply(`parameter count doesn't match`)
            return
        }

        const voiceChannel: VoiceChannel | StageChannel | null | undefined = message.member?.voice.channel
        Log.verbose(JSON.stringify(voiceChannel))
        if (!voiceChannel) {
            return message.channel.send('You need to be in a voice channel to play music')
        }

        // @ts-ignore
        const permissions = voiceChannel.permissionsFor(message.client.user)
        if (!permissions.has(PermissionFlagsBits.Connect) || !permissions.has(PermissionFlagsBits.Speak)) {
            return message.channel.send('I need the permissions to join and speak in your voice channel')
        }

        if (!musicData.isPlaying && musicData.queue.length === 1) musicData.queue.shift()

        const query: string = args[1]
        const playlistCheck =
            query.match(/^(?!.*\?.*\bv=)https:\/\/(www\.)?youtube\.com\/.*\?.*\blist=.*$/) || query.match(/https:\/\/music\.youtube\.com\/playlist\?list=.*/)
        const vidSongCheck =
            query.match(/https:\/\/(www\.)?youtube\.com\/watch\?v=.*/) ||
            query.match(/https:\/\/youtu\.be\/.*/) ||
            query.match(/https:\/\/music\.youtube\.com\/watch\?v=.*/)

        try {
            if (playlistCheck) await playlistHandler(query, voiceChannel, client, message)
            else if (vidSongCheck) await singleVidHandler(query, voiceChannel, client, message)
            else await searchHandler(args, message)
        } catch (err) {
            musicData.isPlaying = false
            await dispatchErrorLog(err)
        }
    }

    return {data, execute}
}

export default Play()
