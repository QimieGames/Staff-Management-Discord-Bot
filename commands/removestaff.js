const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('removestaff')
		.setDescription('Remove a staff from the staff team. [Admin Command]'),
	async execute(interaction) {},
};