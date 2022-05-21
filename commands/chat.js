require('dotenv').config();

const { SlashCommandBuilder } = require('@discordjs/builders');

const nodeFS = require('fs');

const configValue = JSON.parse(nodeFS.readFileSync(process.env.CONFIG_FILE));

const discordBotPrefix = configValue.discord_bot.prefix;

const discordBotAdmin = configValue.roles_id.admin;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('chat')
		.setDescription('Send a chat message ingame. [Admin Command]'),
		
	async execute(interaction, commandType, args, ingameBot) {
		if(commandType === "Slash"){
			interaction.reply({ content: '```Sorry! This command only available through ' + discordBotPrefix + 'chat (Message)```', ephemeral: true });
		} else if(commandType === "Message"){
			if(args[0]){
                if(interaction.member.roles.cache.some(r => r.id === discordBotAdmin) === true){
                    const chatMessage = args.join(' ');
                    if(chatMessage.startsWith('/') === false){
                        const ingameChatChannel = '#' + interaction.guild.channels.cache.get(configValue.discord_channels.ingame_chat).name;
                        ingameBot.chat(chatMessage);
                        interaction.reply('```Sending "' + chatMessage + '" in chat. | Check ' + ingameChatChannel + ' for result.```');
                    } else {
                        interaction.reply('```Please use ' + discordBotPrefix + 'sudo (Command) for commands.```');
                    }
                } else {
                    interaction.reply('```You are not allowed to run this command!```');
                }
            } else {
                interaction.reply('```Invalid Command Usage. Usage: ' + discordBotPrefix + 'chat (Message)```');
            }
		}
	},
};