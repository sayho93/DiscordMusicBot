const {Log} = require('../utils/Logger')
const {prefix} = require('../../config.json')
module.exports = {
    name: 'messageCreate',
    async execute(message){
        Log.info(`message received ${message.content}`)
        if(message.author.bot) return
        if(!message.content.startsWith(prefix)) {
            Log.error(`doesn't match prefix '${prefix}' skipping...`)
            return
        }

        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const commandName = args.shift().toLowerCase();
        Log.info(`command: ${commandName}`)

        const command = message.client.commands.get(commandName)
        if(!command){
            Log.error(`command ${commandName} does not exist`)
            return
        }

        try{
            await command.execute(message)
        } catch(error){
            console.error(error)
            await message.reply({content: 'There was an error while executing this command'})
        }
    }
}