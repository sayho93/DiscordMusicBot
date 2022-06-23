import dotenv from 'dotenv'

dotenv.config()

const Config = {
    prefix: '!',
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
    token: process.env.TOKEN,
    youtubeAPI: process.env.YOUTUBE_API_KEY,
}

export default Config
