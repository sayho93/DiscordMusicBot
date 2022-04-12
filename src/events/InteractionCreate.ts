import {Log} from '../utils/Logger'
import {Guild, GuildMember, Interaction, MessageEmbed, Snowflake} from 'discord.js'
const Youtube = require('simple-youtube-api')
import {youtubeAPI} from '../../config.json'
import * as Utils from '../utils/Utils'
import {DiscordBotClient} from '../structures/DiscordBotClient'
const youtube = new Youtube(youtubeAPI)

export default {
    name: 'interactionCreate',
    execute: async (interaction: Interaction, client: DiscordBotClient) => {
        if (interaction.isSelectMenu()) {
            try {
                const video = await youtube.getVideo(interaction.values[0])
                const guild: Guild | undefined = client.guilds.cache.get(interaction.guildId ?? '')
                const member: GuildMember | undefined = guild?.members.cache.get(<Snowflake>interaction.member?.user.id)

                const song = Utils.formatVideo(video, member?.voice.channel)
                if (!song) return interaction.reply('Video is either private or it does not exist')

                //TODO FIND VOICE CHANNEL ID ?????
                client.musicData.queue.push(song)
                const queue: any[] = client.musicData.queue
                Log.info(`${song.title} added to queue`)
                Log.info(`queue length: ${queue.length}`)

                const embed: MessageEmbed = new MessageEmbed()
                    .setColor('#ffffff')
                    .setTitle('Queued')
                    .setDescription(`Queued 1 track`)
                    .addField(`Total Queue`, `${queue.length} tracks`)
                    .addField(`Track`, `:musical_note:  ${song.title} :musical_note: has been added to queue`)
                    .setThumbnail(song.thumbnail)

                await interaction.reply({embeds: [embed]})

                if (!client.musicData.isPlaying) {
                    client.musicData.isPlaying = true
                    return client.playSong(interaction)
                }
            } catch (err) {
                if (err instanceof Error) Log.error(err.stack)
            }
        }

        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName)
            if (!command) return
            try {
                Log.info(`request:: command: ${interaction.commandName}, user: ${interaction.user.tag}`)
                await command.execute(interaction)
            } catch (err) {
                if (err instanceof Error) Log.error(err.stack)
                await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true})
            }
        }
    },
}
