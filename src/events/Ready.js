const {Log} = require('../utils/Logger')
module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        Log.verbose(`SayhoBot server ready`)
        Log.verbose(`Logged in as ${client.user.tag}`)
    },
}