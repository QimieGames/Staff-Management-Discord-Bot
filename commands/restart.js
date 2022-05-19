const { SlashCommandBuilder } = require('@discordjs/builders');

const nodeFS = require('fs');

const configValue = JSON.parse(nodeFS.readFileSync(process.env.CONFIG_FILE));

const discordBotAdmin = configValue.roles_id.admin;

const discordBotPrefix = configValue.discord_bot.prefix;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('restart')
		.setDescription('Restart the bot. [Admin Command]'),
		
	async execute(interaction,commandType, args) {
		if(commandType === "Slash"){
			if(interaction.member.roles.cache.some(r => r.id === discordBotAdmin) === true){
				interaction.reply({content: '```Restarting...```', ephemeral: true }).then(() => {
					process.exit(0);
				});
			} else {
				interaction.reply({ content: '```You are not allowed to run this command!```', ephemeral: true });
			}
		} else if(commandType === "Message"){
			if(!args[0]){
				if(interaction.member.roles.cache.some(r => r.id === discordBotAdmin) === true){
					interaction.reply('```Restarting...```').then(() => {
						process.exit(0);
					});
				} else {
					interaction.reply('```You are not allowed to run this command!```');
				}
			} else {
				interaction.reply('```Invalid Command Usage. Usage: ' + discordBotPrefix + 'restart```');
			}
		}

	},
};