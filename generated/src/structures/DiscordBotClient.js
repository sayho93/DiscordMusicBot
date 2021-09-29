"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordBotClient = exports.MusicType = void 0;
const discord_js_1 = require("discord.js");
const voice_1 = require("@discordjs/voice");
// import {raw}  from "youtube-dl-exec"
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const Logger_js_1 = require("../utils/Logger.js");
class MusicType {
    constructor() {
        this.queue = [];
        this.isPlaying = false;
        this.volume = 1;
    }
}
exports.MusicType = MusicType;
class DiscordBotClient extends discord_js_1.Client {
    constructor(props) {
        super(props);
        this.commands = new discord_js_1.Collection();
        this.musicData = new MusicType();
        this.connection = null;
    }
    async playSong(message) {
        const queue = this.musicData.queue;
        Logger_js_1.Log.debug(queue.length);
        Logger_js_1.Log.debug(JSON.stringify(queue[0]));
        this.connection = await (0, voice_1.joinVoiceChannel)({
            channelId: queue[0].voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        });
        //TODO ytdl suffers from socket connection end in long videos
        const stream = (0, ytdl_core_1.default)(queue[0].url, {
            quality: 'highestaudio',
            highWaterMark: 1024 * 1024 * 10
        });
        // Log.error(queue[0].url)
        // const stream: any = raw(queue[0].url, {
        //     o: '-',
        //     q: '',
        //     f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
        //     r: '100K',
        // }, {stdio: ['ignore', 'pipe', 'ignore']})
        const resource = (0, voice_1.createAudioResource)(stream, { inputType: voice_1.StreamType.Arbitrary });
        // const resource = createAudioResource(stream.stdout, {inputType: StreamType.Arbitrary})
        const player = (0, voice_1.createAudioPlayer)();
        player.play(resource);
        this.connection.subscribe(player);
        player
            .on(voice_1.AudioPlayerStatus.Playing, () => {
            const currentItem = queue[0];
            const embed = new discord_js_1.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`:: Currently playing :arrow_forward: ::`)
                .setDescription(`${currentItem.title} (${currentItem.duration})`)
                .setURL(currentItem.url)
                .setThumbnail(currentItem.thumbnail);
            message.channel.send({ embeds: [embed] });
            Logger_js_1.Log.info(`Currently playing ${currentItem.title}`);
            queue.shift();
        })
            .on(voice_1.AudioPlayerStatus.Idle, () => {
            if (queue.length >= 1) {
                Logger_js_1.Log.debug(JSON.stringify(queue));
                Logger_js_1.Log.debug('queue length is not zero');
                Logger_js_1.Log.info(queue.length);
                Logger_js_1.Log.info(JSON.stringify(queue[queue.length - 1]));
                if (this.musicData.queue.length === 0)
                    return;
                return this.playSong(message);
            }
            else {
                Logger_js_1.Log.debug('queue empty');
                this.musicData.isPlaying = false;
                setTimeout(() => {
                    if (this.musicData.queue.length < 1) {
                        message.channel.send(`Disconnected from channel due to inactivity`);
                        if (this.connection !== null)
                            this.connection.destroy();
                    }
                }, 180000);
            }
        })
            .on('error', () => {
            message.guild.musicData.isPlaying = false;
            message.channel.send('error occurred');
            if (this.connection !== null)
                return this.connection.destroy();
        });
    }
}
exports.DiscordBotClient = DiscordBotClient;
//# sourceMappingURL=DiscordBotClient.js.map