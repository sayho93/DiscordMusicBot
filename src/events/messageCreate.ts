import {Message} from 'discord.js'
import {Log} from '../utils/logger'
import {prefix} from '../../config.json'
import {DiscordBotClientObj} from '../index'
import {onError} from '../utils/utils'

export default {
    name: 'messageCreate',
    execute: async (message: Message, client: DiscordBotClientObj) => {
        Log.info(`message received ${message.content}`)
        if (message.author.bot) return

        if (!message.content.startsWith(prefix)) {
            Log.verbose(`doesn't match prefix '${prefix}' skipping...`)
            return
        }

        const args: string[] = message.content.slice(prefix.length).trim().split(/ +/g)
        const commandName: string = args.shift()?.toLowerCase() ?? ''
        Log.info(`command: ${commandName}`)

        const command = client.commands.get(commandName)
        if (!command) {
            Log.error(`command ${commandName} does not exist`)
            return
        }

        try {
            await command.execute(message, client)
        } catch (err) {
            onError(err, message)
            await message.reply({content: 'There was an error while executing this command'})
        }
    },
}
