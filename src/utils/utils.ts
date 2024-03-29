import {EmbedBuilder, StageChannel, VoiceChannel, WebhookClient} from 'discord.js'
import {Song} from '#root/src'
import {HttpUtil} from '#utils/http'
import Config from '#configs/config'

export const formatDuration = (durationObj: any) => {
    return `${durationObj.hours ? durationObj.hours + ':' : ''}${durationObj.minutes ? durationObj.minutes : '00'}:${
        durationObj.seconds < 10 ? '0' + durationObj.seconds : durationObj.seconds ? durationObj.seconds : '00'
    }`
}

export const formatVideo = (video: any, voiceChannel: VoiceChannel | StageChannel): Song | null => {
    if (video.title === 'Deleted video') {
        return null
    }
    let duration: string | null = video.duration !== undefined ? formatDuration(video.duration) : null
    if (duration === '00:00') duration = 'Live Stream'
    return {
        url: `https://www.youtube.com/watch?v=${video.raw.id}`,
        title: video.raw.snippet.title,
        duration,
        thumbnail: video.thumbnails.high.url,
        voiceChannel,
        video: video,
        videoId: video.raw.id,
    }
}

export const formatMessageEmbed = (url: string, queuedCount: number, queueLength: number, title: string, thumbnail: string) => {
    return new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Queued')
        .setURL(url)
        .setDescription(`Queued ${queuedCount} track${queuedCount === 1 ? '' : 's'}`)
        .addFields([
            {name: 'Total Queue', value: `${queueLength} tracks`},
            {name: 'Track', value: `:musical_note:  ${title} :musical_note: has been added to queue`},
        ])
        .setThumbnail(thumbnail)
}

// export const onError = (err: unknown, message: Message) => {
//     if (err instanceof Error) {
//         Log.error(err.stack)
//         const embed = new MessageEmbed()
//             .setColor('RED')
//             .setTitle('An error has occurred')
//             .setDescription(<string>err.stack)
//         message.reply({embeds: [embed]}).then()
//     }
// }

export const getWebhookCredentials = async () => {
    if (!Config.webhookUrl) throw new Error('webhook url is required')
    const webhookInfo = await HttpUtil.getData(Config.webhookUrl)
    Config.webhookId = webhookInfo.id
    Config.webhookToken = webhookInfo.token
}

export const dispatchErrorLog = async (error: any, title?: string) => {
    if (!Config.webhookId || !Config.webhookToken) throw new Error('webhook credentials are missing')

    const webhookClient = new WebhookClient({id: Config.webhookId, token: Config.webhookToken})
    const embed = new EmbedBuilder()
        .setTitle(title ? title : 'Error Report')
        .setColor('#ff0000')
        .setDescription(<string>error.stack)
        // .addField('Stack', error.stack)
        .addFields([{name: 'Message', value: error.message}])
    await webhookClient.send({embeds: [embed]})
}
