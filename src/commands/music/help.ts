import {SlashCommandBuilder} from '@discordjs/builders'
import {Message, EmbedBuilder} from 'discord.js'
import Config from '#configs/config'

export default {
    data: new SlashCommandBuilder().setName('h').setDescription('show commands'),
    execute: async (message: Message) => {
        if (!message.member?.voice.channel) return message.reply('You have to be in a voice channel to make bot leave')
        const embed: EmbedBuilder = new EmbedBuilder()
            .setColor('#ffffff')
            .setTitle('Commands')
            .addFields([
                {name: 'prefix', value: Config.prefix},
                {name: 'p', value: `음악 재생 => ${Config.prefix}p [uri]`},
                {name: 's', value: `음악 스킵 => ${Config.prefix}s`},
                {name: 'q', value: `음악 큐 리스트 조회 => ${Config.prefix}q`},
                {name: 'eq', value: `음악 큐 제거 => ${Config.prefix}eq`},
                {name: 'l', value: `내보내기 => ${Config.prefix}l`},
                {
                    name: '재생을 하지 않을 시 매뉴얼',
                    value: '$l을 사용해 봇 내보내기 이후 다시 플레이\n만일 내보내기가 되지 않는다면 채널 인원 목록에서 봇 우클릭 후 연결 끊기 이후 $p로 재사용',
                },
            ])

        await message.reply({embeds: [embed]})
    },
}
