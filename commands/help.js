require('dotenv').config();

const { SlashCommandBuilder } = require('@discordjs/builders');

const { readFileSync } = require('fs');

const { MessageEmbed } = require('discord.js');

const YAML = require('js-yaml');

const config = YAML.load(readFileSync(process.env.CONFIG_FILE));

const discordBotPrefix = config.discord_bot.prefix;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Shows commands list.'),
	async execute(interaction) {
	const helpMenuEmbed = new MessageEmbed()
	.setColor('#25c42b')
	.setTitle('COMMANDS LIST')
	.setURL('https://mchub.com/')
	.setDescription(discordBotPrefix + 'help = Shows this menu.\n\n' + discordBotPrefix + "stats (IGN) = Check a staff member's staffstats.\n\n" + discordBotPrefix + 'vote (IGN) (Rank To Promote/Demote To) = Start a promotion/demotion vote on said staff member. [Admin Command]\n\n' + discordBotPrefix + 'promote (IGN) (Rank To Promote To) = Promote a staff member. [Admin Command]\n\n' + discordBotPrefix + 'demote (IGN) (Rank To Demote To) = Demote a staff member. [Admin Command]\n\n' + discordBotPrefix + 'addstaff (IGN) (Gamemode) (Rank) = Add a new player to the staff team. [Admin Command]\n\n' + discordBotPrefix + "editstaff (IGN) (New IGN) (New Rank) (New Gamemode) = Edit a staff member's details. [Admin Command]\n\n" + discordBotPrefix + 'removestaff (IGN) = Remove a staff member from the staff team. [Admin Command]\n\n' + discordBotPrefix + 'sudo (Command) = Run a command ingame. [Admin Command]\n\n' + discordBotPrefix + 'restart = Restart the bot. [Admin Command]')
	.setThumbnail('https://i.imgur.com/3ovjQst.png')
	.setTimestamp()
	.setFooter({text: 'Custom Coded By QimieGames', iconURL: 'https://i.imgur.com/io8hIIm.png'});

	interaction.reply({embeds: [helpMenuEmbed]});
	},
};