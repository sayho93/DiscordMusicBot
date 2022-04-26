import {Log} from '../utils/Logger'
import {CommandInteraction, Guild, GuildMember, Interaction, SelectMenuInteraction, Snowflake} from 'discord.js'
const Youtube = require('simple-youtube-api')
import {youtubeAPI} from '../../config.json'
import * as Utils from '../utils/Utils'
import {DiscordBotClient} from '../structures/DiscordBotClient'
import {formatMessageEmbed, Song} from '../utils/Utils'
const youtube = new Youtube(youtubeAPI)

const InteractionCreate = () => {
    const selectMenuHandler = async (interaction: SelectMenuInteraction, client: DiscordBotClient) => {
        try {
            const video = await youtube.getVideo(interaction.values[0])
            const guild: Guild | undefined = client.guilds.cache.get(interaction.guildId ?? '')
            const member: GuildMember | undefined = guild?.members.cache.get(<Snowflake>interaction.member?.user.id)

            const song: Song | null = Utils.formatVideo(video, member?.voice.channel)
            if (!song) {
                return interaction.reply('Video is either private or it does not exist')
            }

            client.musicData.queue.push(song)
            const queue: Song[] = client.musicData.queue
            Log.info(`${song.title} added to queue`)
            Log.info(`queue length: ${queue.length}`)

            await interaction.reply({embeds: [formatMessageEmbed(interaction.values[0], 1, queue.length, song.title, song.thumbnail)]})

            if (!client.musicData.isPlaying) {
                client.musicData.isPlaying = true
                return client.playSong(interaction)
            }
        } catch (err) {
            if (err instanceof Error) Log.error(err.stack)
        }
    }

    const commandHandler = async (interaction: CommandInteraction, client: DiscordBotClient) => {
        const command = client.commands.get(interaction.commandName)
        if (!command) return
        Log.info(`request:: command: ${interaction.commandName}, user: ${interaction.user.tag}`)
        try {
            await command.execute(interaction)
        } catch (err) {
            if (err instanceof Error) Log.error(err.stack)
            await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true})
        }
    }

    const execute = async (interaction: Interaction, client: DiscordBotClient) => {
        if (interaction.isSelectMenu()) await selectMenuHandler(interaction, client)
        else if (interaction.isCommand()) await commandHandler(interaction, client)
    }

    return {
        name: 'interactionCreate',
        execute,
    }
}

export default InteractionCreate()
