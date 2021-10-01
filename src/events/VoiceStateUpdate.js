module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState){
        if(oldState.channelId !== oldState.guild.me.voice.channelId || newState.channel) return
        if(!(oldState.channel.members.size - 1)){
            setTimeout(() => {
                if(!(oldState.channel.members.size - 1)){
                    const channel = oldState.client.channels.cache.filter((channel) => channel.name === '일반').first()
                    // channel.send('Disconnected from channel due to inactivity')
                    channel.send('바윙~')
                    oldState.client.connection.destroy()
                }
            }, 5000)
            // 180000
        }
    }
}