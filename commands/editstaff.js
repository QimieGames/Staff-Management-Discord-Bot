const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('editstaff')
		.setDescription("Edit a staff's data. [Admin Command]"),
	async execute(interaction) {},
};