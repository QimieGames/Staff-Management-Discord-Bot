const { SlashCommandBuilder } = require('@discordjs/builders');

const DiscordJS = require('discord.js');

const nodeFS = require('fs');

const configValue = JSON.parse(nodeFS.readFileSync(process.env.CONFIG_FILE));

const discordBotPrefix = configValue.discord_bot.prefix;

const helpMenuEmbed = new DiscordJS.MessageEmbed()
	.setColor('#4821bf')
	.setTitle('COMMANDS LIST')
	.setURL('https://mchub.com/')
	.setDescription(discordBotPrefix + 'help = Shows this menu.\n\n' + discordBotPrefix + "staffstats (IGN) = Check a staff member's staffstats.\n\n" + discordBotPrefix + 'vote (IGN) (Rank To Promote/Demote To) = Start a promotion/demotion vote on said staff member. [Admin Command]\n\n' + discordBotPrefix + 'promote (IGN) (Rank To Promote To) = Promote a staff member. [Admin Command]\n\n' + discordBotPrefix + 'demote (IGN) (Rank To Demote To) = Demote a staff member. [Admin Command]\n\n' + discordBotPrefix + 'addstaff (IGN) (Gamemode) (Rank) = Add a new player to the staff team. [Admin Command]\n\n' + discordBotPrefix + "editstaff (IGN) (New IGN) (New Rank) (New Gamemode) = Edit a staff member's details. [Admin Command]\n\n" + discordBotPrefix + 'removestaff (IGN) = Remove a staff member from the staff team. [Admin Command]\n\n' + discordBotPrefix + 'sudo (Command) = Run a command ingame. [Admin Command]\n\n' + discordBotPrefix + 'restart = Restart the bot. [Admin Command]')
	.setThumbnail('https://i.imgur.com/3ovjQst.png')
	.setTimestamp()
	.setFooter({ text: 'Custom Coded By QimieGames', iconURL: 'https://i.imgur.com/io8hIIm.png' });

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Shows commands list.'),
		
	async execute(interaction, commandType, args) {
		if(commandType === "Slash"){
			interaction.reply({ embeds: [helpMenuEmbed], ephemeral: true });
		} else if(commandType === "Message"){
			if(!args[0]){
				interaction.reply({ embeds: [helpMenuEmbed] });
			} else {
				interaction.reply('```Invalid Command Usage. Usage: ' + discordBotPrefix + 'help```');
			}
		}
	},
};