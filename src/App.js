"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const discord = __importStar(require("discord.js"));
const config_json_1 = require("../config.json");
const DiscordBotClient_1 = require("./structures/DiscordBotClient");
const Logger_1 = require("./utils/Logger");
const client = new DiscordBotClient_1.DiscordBotClient({ intents: [discord.Intents.FLAGS.GUILDS, discord.Intents.FLAGS.GUILD_MESSAGES, discord.Intents.FLAGS.GUILD_VOICE_STATES] });
fs.readdirSync('src/commands').forEach(dirs => {
    const commands = fs.readdirSync(`src/commands/${dirs}`).filter(files => files.endsWith('.js'));
    commands.forEach(item => {
        const command = require(`./commands/${dirs}/${item}`);
        Logger_1.Log.debug(`[commands] Loading ${item}`);
        client.commands.set(command.data.name.toLowerCase(), command);
    });
});
fs.readdirSync('src/events').filter(file => file.endsWith('.js')).forEach(item => {
    const event = require(`./events/${item}`);
    Logger_1.Log.debug(`[events] Loading ${event.name}`);
    if (event.once)
        client.once(event.name, (...args) => event.execute(...args));
    else
        client.on(event.name, (...args) => event.execute(...args));
});
client.login(config_json_1.token).then();
//# sourceMappingURL=App.js.map