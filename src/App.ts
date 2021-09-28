import * as fs from "fs"
import * as discord from 'discord.js'
import {token} from '../config.json'
import {joinVoiceChannel, createAudioResource, StreamType, createAudioPlayer, AudioPlayerStatus} from '@discordjs/voice'
import * as ytdl from 'youtube-dl-exec'

const client = new discord.Client({intents: [discord.Intents.FLAGS.GUILDS, discord.Intents.FLAGS.GUILD_MESSAGES, discord.Intents.FLAGS.GUILD_VOICE_STATES]})
client.commands = new discord.Collection()
client.musicData = {
    queue: [],
    isPlaying: false,
    volume: 1,
    songDispatcher: null
}

client.connection = null

client.playSong = async (message) => {
    const queue = client.musicData.queue
    Log.debug(queue.length)
    Log.debug(JSON.stringify(queue[0]))
    client.connection = await joinVoiceChannel({
        channelId: queue[0].voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator
    })

    //TODO ytdl suffers from socket connection end in long videos
    // const stream = ytdl(queue[0].url, {
    //     quality: 'highestaudio',
    //     highWaterMark: 1024 * 1024 * 10
    // })
    const stream = ytdl(queue[0].url, {
        o: '-',
        q: '',
        f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
        r: '100K',
    }, { stdio: ['ignore', 'pipe', 'ignore'] })


    // const resource = createAudioResource(stream, {inputType: StreamType.Arbitrary})
    const resource = createAudioResource(stream.stdout, {inputType: StreamType.Arbitrary})
    const player = createAudioPlayer()

    player.play(resource)
    client.connection.subscribe(player)
    player
        .on(AudioPlayerStatus.Playing, () => {
            const currentItem = queue[0]
            const embed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`:: Currently playing :arrow_forward: ::`)
                .setDescription(`${currentItem.title} (${currentItem.duration})`)
                .setURL(currentItem.url)
                .setThumbnail(currentItem.thumbnail)
            message.channel.send({embeds: [embed]})
            Log.info(`Currently playing ${currentItem.title}`)
            queue.shift()
        })
        .on(AudioPlayerStatus.Idle, () => {
            if(queue.length >= 1){
                Log.debug(JSON.stringify(queue))
                Log.debug('queue length is not zero')
                Log.info(queue.length)
                Log.info(JSON.stringify(queue[queue.length - 1]))
                if(client.musicData.queue.length === 0) return
                return client.playSong(message)
            } else{
                Log.debug('queue empty')
                client.musicData.isPlaying = false

                setTimeout(() => {
                    if(client.musicData.queue.length < 1){
                        message.channel.send(`Disconnected from channel due to inactivity`)
                        client.connection.destroy()
                    }
                }, 180000)
            }
        })
        .on('error', () => {
            message.guild.musicData.isPlaying = false
            message.channel.send('error occurred')
            return client.connection.destroy()
        })
}

fs.readdirSync('src/commands').forEach(dirs => {
    const commands = fs.readdirSync(`src/commands/${dirs}`).filter(files => files.endsWith('.js'))
    commands.forEach(item => {
        const command = require(`./commands/${dirs}/${item}`)
        Log.debug(`[commands] Loading ${item}`)
        client.commands.set(command.data.name.toLowerCase(), command)
    })
})

fs.readdirSync('src/events').filter(file => file.endsWith('.js')).forEach(item => {
    const event = require(`./events/${item}`)
    Log.debug(`[events] Loading ${event.name}`)
    if(event.once) client.once(event.name, (...args) => event.execute(...args))
    else client.on(event.name, (...args) => event.execute(...args))
})

client.login(token).then()
