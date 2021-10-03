import {SlashCommandBuilder} from "@discordjs/builders"
import {Message, MessageEmbed} from "discord.js"
import {prefix} from '../../../config.json'

export default {
    data: new SlashCommandBuilder()
        .setName('h')
        .setDescription('show commands'),
    async execute(message: Message){
        if(!message.member?.voice.channel) return message.reply('You have to be in a voice channel to make bot leave')
        const embed: MessageEmbed = new MessageEmbed()
            .setColor('#ffffff')
            .setTitle('Commands')
            .addField('prefix', prefix)
            .addField(`p`, `음악 재생 => ${prefix}p [uri]`)
            .addField(`s`, `음악 스킵 => ${prefix}s`)
            .addField(`q`, `음악 큐 리스트 조회 => ${prefix}q`)
            .addField(`eq`, `음악 큐 제거 => ${prefix}eq`)
            .addField(`l`, `내보내기 => ${prefix}l`)
            .addField('재생을 하지 않을 시 매뉴얼', '$l을 사용해 봇 내보내기 이후 다시 플레이\n만일 내보내기가 되지 않는다면 채널 인원 목록에서 봇 우클릭 후 연결 끊기 이후 $p로 재사용')
        await message.reply({embeds: [embed]})
    }
}