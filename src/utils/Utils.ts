import axios from "axios"

class Utils{
    getData = (url: string, params: any) => {
        return new Promise(async (resolve, reject) => {
            await axios.get(url, {params: params})
                .then((response) => {
                    resolve(response.data)
                })
                .catch(error => reject(error))
        })
    }

    postData = (url: string, data: any) => {
        return new Promise(async (resolve, reject) => {
            await axios.post(url, data)
                .then((response) => {
                    resolve(response.data)
                })
                .catch(error => reject(error))
        })
    }

    formatDuration = (durationObj: any) => {
        return `${durationObj.hours ? durationObj.hours + ':' : ''}${
            durationObj.minutes ? durationObj.minutes : '00'
        }:${
            durationObj.seconds < 10
                ? '0' + durationObj.seconds
                : durationObj.seconds
                    ? durationObj.seconds
                    : '00'
        }`
    }

    formatVideo = (video: any, voiceChannel: any) => {
        const url = `https://www.youtube.com/watch?v=${video.raw.id}`
        const title = video.raw.snippet.title
        let duration = video.duration !== undefined ? this.formatDuration(video.duration) : null
        const thumbnail = video.thumbnails.high.url
        if(duration === '00:00') duration = 'Live Stream'
        return {
            url: url,
            title: title,
            duration: duration,
            thumbnail: thumbnail,
            voiceChannel: voiceChannel,
            video: video
        }
    }
}

export default new Utils()