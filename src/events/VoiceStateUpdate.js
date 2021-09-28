module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState){
        if(oldState.channelId !== oldState.guild.me.voice.channelId || newState.channel) return
        if(!(oldState.channel.members.size - 1)){
            setTimeout(() => {
                if(!(oldState.channel.members.size - 1)) oldState.client.connection.destroy()
            }, 180000)
        }
    }
}