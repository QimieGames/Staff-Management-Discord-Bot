const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('promote')
		.setDescription('Promote a staff. [Admin Command]'),
	async execute(interaction) {},
};