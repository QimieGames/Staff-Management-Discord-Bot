const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('vote')
		.setDescription('Starts a promotion/demotion vote on a staff. [Admin Command]'),
	async execute(interaction) {},
};