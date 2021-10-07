import {Client, ClientOptions, Collection, MessageEmbed} from "discord.js"
import {
    AudioPlayer,
    AudioPlayerStatus, AudioResource,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    StreamType,
    VoiceConnection
} from "@discordjs/voice"
// import {raw}  from "youtube-dl-exec"
import {Log} from '../utils/Logger'
import Utils from "../utils/Utils"
import ytdl from 'ytdl-core'
import {HttpsProxyAgent} from "https-proxy-agent"

export class MusicType{
    constructor(){
        this.queue = []
        this.isPlaying = false
        this.volume = 1
        this.player = null
    }
    public queue: any[]
    public isPlaying: Boolean
    public volume: number
    public player: AudioPlayer | null
}

export class DiscordBotClient extends Client{
    constructor(props: ClientOptions){
        super(props)
        this.commands = new Collection()
        this.musicData = new MusicType()
        this.connection = null
    }
    public commands: Collection<any, any>
    public musicData: MusicType
    public connection: VoiceConnection | null

    public async playSong(message: any){
        this.connection = await joinVoiceChannel({
            channelId: this.musicData.queue[0].voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        })

        const video = await this.musicData.queue[0].video.fetch()
        this.musicData.queue[0] = Utils.formatVideo(video, this.musicData.queue[0].voiceChannel)

        // TODO ytdl suffers from socket connection end in long videos
        const proxy = 'http://125.141.117.38:80'
        const agent = new HttpsProxyAgent(proxy)
        const COOKIE = "SIDCC=AJi4QfELkcwy6l26sj5RQlxZtEDDxDXpsK5dUgHRGvcwwmcnu9ueymWCw7Gdszgvb928PlDNxA; PREF=f6=80&tz=Asia.Seoul&volume=25; _gcl_au=1.1.2135986710.1633348359; APISID=cPgtpj4jUjtt0CxI/AZwBbTfZfYl-pqp4Y; SAPISID=_1urEbnzuus20a0D/AiSvaxYewC0MNFwbi; SID=CAhu40kJ-CU6mfaiDmCo6CvJJIcXnMGSeAxpH-g8me45h1wiPGjYTvxhs7EytKM5iw3xEg.; __Secure-1PAPISID=_1urEbnzuus20a0D/AiSvaxYewC0MNFwbi; __Secure-3PAPISID=_1urEbnzuus20a0D/AiSvaxYewC0MNFwbi"
        let validate = ytdl.validateURL(this.musicData.queue[0].url)
        if(!validate) Log.error('Please input a **valid** URL.');
        const stream = ytdl(this.musicData.queue[0].videoId, {
            requestOptions: {
                headers: {
                    cookie: COOKIE,
                    'x-youtube-identity-token': "QUFFLUhqbTQ3VTNPbi12SnhpSEN5NGVzUmxOaDNBMWxEQXw=",
                }
                // agent
            },
            filter: 'audioonly',
            quality: 'highestaudio',
            // highWaterMark: 1 << 25,
            highWaterMark: 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
            liveBuffer: 4000,
        })
            .on('error', (error: any) => {
                console.log(error)
            })

        // const stream: any = raw(this.musicData.queue[0].url, {
        //     o: '-',
        //     q: '',
        //     f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
        //     r: '100K',
        // }, {stdio: ['ignore', 'pipe', 'ignore']})

        const resource: AudioResource = createAudioResource(stream, {inputType: StreamType.Arbitrary})
        // const resource:AudioResource = createAudioResource(stream.stdout, {inputType: StreamType.Arbitrary})
        const player: AudioPlayer = createAudioPlayer()
        this.musicData.player = player

        player.play(resource)
        this.connection.subscribe(player)
        player
            .on(AudioPlayerStatus.Playing, () => {
                const currentItem = this.musicData.queue[0]
                if(currentItem !== undefined){
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
                if(this.musicData.queue.length > 1){
                    Log.debug('queue length is not zero')
                    this.musicData.queue.shift()
                    return this.playSong(message)
                } else{
                    Log.debug('queue empty')
                    this.musicData.isPlaying = false
                    setTimeout(() => {
                        if(this.musicData.queue.length <= 1 && !this.musicData.isPlaying){
                            this.musicData = new MusicType()
                            message.channel.send(`Disconnected from channel due to inactivity`)
                            if(this.connection !== null) this.connection.destroy()
                        }
                    }, 180000)
                }
            })
            .on('error', (error) => {
                console.log(error)
                this.musicData.isPlaying = false
                message.channel.send('error occurred')
                if(this.connection !== null) return this.connection.destroy()
            })
    }
}
