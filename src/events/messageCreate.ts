import {Message} from 'discord.js'
import {Log} from '#utils/logger'
import Config from '#configs/config'
import {DiscordBotClient} from '#root/src'
import {dispatchErrorLog} from '#utils/utils'

export default {
    name: 'messageCreate',
    execute: async (message: Message, client: DiscordBotClient) => {
        Log.info(`message received ${message.content}`)
        if (message.author.bot) return

        if (!message.content.startsWith(Config.prefix)) {
            Log.verbose(`doesn't match prefix '${Config.prefix}' skipping...`)
            return
        }

        const args: string[] = message.content.slice(Config.prefix.length).trim().split(/ +/g)
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
            await dispatchErrorLog(err)
            await message.reply({content: 'There was an error while executing this command'})
        }
    },
}
