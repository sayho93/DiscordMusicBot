import {Message, MessageEmbed} from 'discord.js'
import {Log} from './Logger'

export const formatDuration = (durationObj: any) => {
    return `${durationObj.hours ? durationObj.hours + ':' : ''}${durationObj.minutes ? durationObj.minutes : '00'}:${
        durationObj.seconds < 10 ? '0' + durationObj.seconds : durationObj.seconds ? durationObj.seconds : '00'
    }`
}

export const formatVideo = (video: any, voiceChannel: any) => {
    if (video.title === 'Deleted video') {
        return null
    }
    const url = `https://www.youtube.com/watch?v=${video.raw.id}`
    const title = video.raw.snippet.title
    let duration = video.duration !== undefined ? formatDuration(video.duration) : null
    const thumbnail = video.thumbnails.high.url
    if (duration === '00:00') duration = 'Live Stream'
    return {
        url: url,
        title: title,
        duration: duration,
        thumbnail: thumbnail,
        voiceChannel: voiceChannel,
        video: video,
        videoId: video.raw.id,
    }
}

export const onError = (err: unknown, message: Message) => {
    if (err instanceof Error) {
        Log.error(err.stack)
        const embed = new MessageEmbed()
            .setColor('RED')
            .setTitle('An error has occurred')
            .setDescription(<string>err.stack)
        message.reply({embeds: [embed]}).then()
    }
}
