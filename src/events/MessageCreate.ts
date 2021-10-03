import {Message} from "discord.js"
import {Log} from '../utils/Logger'
import {prefix} from '../../config.json'
import {DiscordBotClient} from "../structures/DiscordBotClient"

export default {
    name: 'messageCreate',
    async execute(message: Message, client: DiscordBotClient){
        Log.info(`message received ${message.content}`)
        if(message.author.bot) return
        if(!message.content.startsWith(prefix)) {
            Log.verbose(`doesn't match prefix '${prefix}' skipping...`)
            return
        }

        const args: string[] = message.content.slice(prefix.length).trim().split(/ +/g)
        const commandName: string = args.shift()?.toLowerCase() ?? ''
        Log.info(`command: ${commandName}`)

        const command = client.commands.get(commandName)
        if(!command){
            Log.error(`command ${commandName} does not exist`)
            return
        }

        try{
            await command.execute(message, client)
        } catch(err){
            if(err instanceof Error) Log.error(err.stack)
            await message.reply({content: 'There was an error while executing this command'})
        }
    }
}