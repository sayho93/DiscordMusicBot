import {Log} from '#utils/logger'
import {CommandInteraction, Guild, GuildMember, Interaction, SelectMenuInteraction, Snowflake} from 'discord.js'

// @ts-ignore
import Youtube from 'simple-youtube-api/src/index.js'
// const Youtube = require('simple-youtube-api')
import Config from '#configs/config'
import {formatMessageEmbed, formatVideo} from '#utils/utils'
import {DiscordBotClient, Song} from '../index'
const youtube = new Youtube(Config.youtubeAPI)

const selectMenuHandler = async (interaction: SelectMenuInteraction, discordBotClient: DiscordBotClient) => {
    try {
        const video = await youtube.getVideo(interaction.values[0])
        const guild: Guild | undefined = discordBotClient.client.guilds.cache.get(interaction.guildId ?? '')
        const member: GuildMember | undefined = guild?.members.cache.get(<Snowflake>interaction.member?.user.id)

        if (!member || !member.voice.channel) {
            return interaction.reply('Cannot find channel')
        }
        const song: Song | null = formatVideo(video, member.voice.channel)
        if (!song) {
            return interaction.reply('Video is either private or it does not exist')
        }

        const musicData = discordBotClient.getMusicData()

        musicData.queue.push(song)
        const queue: Song[] = musicData.queue
        Log.info(`${song.title} added to queue`)
        Log.info(`queue length: ${queue.length}`)

        await interaction.reply({embeds: [formatMessageEmbed(interaction.values[0], 1, queue.length, song.title, song.thumbnail)]})

        if (!musicData.isPlaying) {
            discordBotClient.setMusicData({
                ...musicData,
                isPlaying: true,
            })
            await discordBotClient.playSong(interaction)
        }
    } catch (err) {
        if (err instanceof Error) Log.error(err.stack)
    }
}

const commandHandler = async (interaction: CommandInteraction, discordBotClient: DiscordBotClient) => {
    const command = discordBotClient.commands.get(interaction.commandName)
    if (!command) return
    Log.info(`request:: command: ${interaction.commandName}, user: ${interaction.user.tag}`)
    try {
        await command.execute(interaction)
    } catch (err) {
        if (err instanceof Error) Log.error(err.stack)
        await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true})
    }
}

export default {
    name: 'interactionCreate',
    execute: async (interaction: Interaction, client: DiscordBotClient) => {
        if (interaction.isSelectMenu()) await selectMenuHandler(interaction, client)
        else if (interaction.isCommand()) await commandHandler(interaction, client)
    },
}
