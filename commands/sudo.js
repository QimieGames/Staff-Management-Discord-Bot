const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sudo')
		.setDescription('Run a command ingame. [Admin Command]'),
	async execute(interaction) {},
};