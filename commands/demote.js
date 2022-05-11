const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('demote')
		.setDescription('Demote a staff. [Admin Command]'),
	async execute(interaction) {},
};