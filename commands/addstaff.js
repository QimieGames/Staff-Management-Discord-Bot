const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addstaff')
		.setDescription('Adds a new player to the staff team. [Admin Command]'),
	async execute(interaction) {},
};