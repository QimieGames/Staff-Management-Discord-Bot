require('dotenv').config();

const { SlashCommandBuilder } = require('@discordjs/builders');

const nodeFS = require('fs');

const configValue = JSON.parse(nodeFS.readFileSync(process.env.CONFIG_FILE));

const discordBotPrefix = configValue.discord_bot.prefix;

const discordBotAdmin = configValue.roles_id.admin;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sudo')
		.setDescription('Run a command ingame. [Admin Command]'),
		
	async execute(interaction, commandType, args, ingameBot) {
		if(commandType === "Slash"){
			interaction.reply({ content: '```Sorry! This command only available through ' + discordBotPrefix + 'sudo (Command)```', ephemeral: true });
		} else if(commandType === "Message"){
			if(args[0]){
                if(interaction.member.roles.cache.some(r => r.id === discordBotAdmin) === true){
                    const ingameChatChannel = '#' + interaction.guild.channels.cache.get(configValue.discord_channels.ingame_chat).name;
                    const sudoCommand = args.join(' ');
                    ingameBot.chat('/' + sudoCommand);
                    interaction.reply('```Running /' + sudoCommand + ' | Check ' + ingameChatChannel + ' for result.```');
                } else {
                    interaction.reply('```You are not allowed to run this command!```');
                }
            } else {
                interaction.reply('```Invalid Command Usage. Usage: ' + discordBotPrefix + 'sudo (Command)```');
            }
		}
	},
};