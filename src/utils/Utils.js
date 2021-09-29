const axios = require('axios')

class Utils{
    getData = (url, params) => {
        return new Promise(async (resolve, reject) => {
            await axios.get(url, {params: params})
                .then((response) => {
                    resolve(response.data)
                })
                .catch(error => reject(error))
        })
    }

    postData = (url, data) => {
        return new Promise(async (resolve, reject) => {
            await axios.post(url, data)
                .then((response) => {
                    resolve(response.data)
                })
                .catch(error => reject(error))
        })
    }

    formatDuration = (durationObj) => {
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

    formatVideo = (video, voiceChannel) => {
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

module.exports = new Utils()