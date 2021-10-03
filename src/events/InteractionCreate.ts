import {Log} from '../utils/Logger'
import {
    Guild,
    GuildMember,
    MessageEmbed,
    SelectMenuInteraction,
    Snowflake
} from "discord.js"
const Youtube = require('simple-youtube-api')
import {youtubeAPI} from '../../config.json'
import Utils from '../utils/Utils'
import {DiscordBotClient} from "../structures/DiscordBotClient"
const youtube = new Youtube(youtubeAPI)

export default {
    name: 'interactionCreate',
    async execute(interaction: SelectMenuInteraction, client: DiscordBotClient){
        if(interaction.isSelectMenu()){
            try{
                const video = await youtube.getVideo(interaction.values[0])
                const guild: Guild | undefined = client.guilds.cache.get(interaction.guildId ?? '')
                const member: GuildMember | undefined = guild?.members.cache.get(<Snowflake>interaction.member?.user.id)

                Log.debug(JSON.stringify(member?.voice))
                // const song = Utils.formatVideo(video, member?.voice.channelId)
                // @ts-ignore
                const song = Utils.formatVideo(video, interaction.member?.voice.channel)
                //TODO FIND VOICE CHANNEL ID ?????
                Log.info(JSON.stringify(song))
                client.musicData.queue.push(song)
                // "888461845457928237"
                const queue: any[] = client.musicData.queue
                Log.info(queue.length)
                // Log.info(JSON.stringify(queue[queue.length - 1]))

                const embed: MessageEmbed = new MessageEmbed()
                    .setColor('#ffffff')
                    .setTitle('Queued')
                    // .setURL(interaction.values[0])
                    .setDescription(`Queued 1 track`)
                    .addField(`Total Queue` ,`${queue.length} tracks`)
                    .addField(`Track` ,`:musical_note:  ${song.title} :musical_note: has been added to queue`)
                    .setThumbnail(song.thumbnail)
                await interaction.reply({embeds: [embed]})

                if(!client.musicData.isPlaying){
                    client.musicData.isPlaying = true
                    return client.playSong(interaction)
                }
            } catch(err){
                if(err instanceof Error) Log.error(err.stack)
            }
        }

        if(interaction.isCommand()){
            const command = client.commands.get(interaction.commandName)
            if(!command) return
            try{
                Log.info(`request:: command: ${interaction.commandName}, user: ${interaction.user.tag}`)
                await command.execute(interaction)
            }catch(err){
                if(err instanceof Error)Log.error(err.stack)
                await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true})
            }
        }
    },
}
