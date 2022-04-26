import {Log} from '../utils/logger'
import {CommandInteraction, Guild, GuildMember, Interaction, SelectMenuInteraction, Snowflake} from 'discord.js'
const Youtube = require('simple-youtube-api')
import {youtubeAPI} from '../../config.json'
import {formatMessageEmbed, formatVideo} from '../utils/utils'
import {DiscordBotClientObj, Song} from '../index'
const youtube = new Youtube(youtubeAPI)

const InteractionCreate = () => {
    const selectMenuHandler = async (interaction: SelectMenuInteraction, discordBotClient: DiscordBotClientObj) => {
        try {
            const video = await youtube.getVideo(interaction.values[0])
            const guild: Guild | undefined = discordBotClient.client.guilds.cache.get(interaction.guildId ?? '')
            const member: GuildMember | undefined = guild?.members.cache.get(<Snowflake>interaction.member?.user.id)

            const song: Song | null = formatVideo(video, member?.voice.channel)
            if (!song) {
                return interaction.reply('Video is either private or it does not exist')
            }

            discordBotClient.musicData.queue.push(song)
            const queue: Song[] = discordBotClient.musicData.queue
            Log.info(`${song.title} added to queue`)
            Log.info(`queue length: ${queue.length}`)

            await interaction.reply({embeds: [formatMessageEmbed(interaction.values[0], 1, queue.length, song.title, song.thumbnail)]})

            if (!discordBotClient.musicData.isPlaying) {
                discordBotClient.musicData.isPlaying = true
                return discordBotClient.playSong(interaction)
            }
        } catch (err) {
            if (err instanceof Error) Log.error(err.stack)
        }
    }

    const commandHandler = async (interaction: CommandInteraction, discordBotClient: DiscordBotClientObj) => {
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

    const execute = async (interaction: Interaction, client: DiscordBotClientObj) => {
        if (interaction.isSelectMenu()) await selectMenuHandler(interaction, client)
        else if (interaction.isCommand()) await commandHandler(interaction, client)
    }

    return {
        name: 'interactionCreate',
        execute,
    }
}

export default InteractionCreate()
