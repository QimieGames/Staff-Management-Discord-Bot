require('dotenv').config();

const { SlashCommandBuilder } = require('@discordjs/builders');

const nodeFS = require('fs');

const configValue = JSON.parse(nodeFS.readFileSync(process.env.CONFIG_FILE));

const discordBotPrefix = configValue.discord_bot.prefix;

const discordBotAdmin = configValue.roles_id.admin;

const discordBotTrusted = configValue.roles_id.trusted;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('staffstats')
		.setDescription("Check a staff member's staffstats.")
        .addStringOption(option =>
            option.setName('ign')
            .setDescription('Staff Ingame Name.')
            .setRequired(true)),
		
	async execute(interaction, commandType, args, ingameBot) {
		if(commandType === "Slash"){
			if(interaction.member.roles.cache.some(r => r.id === discordBotAdmin) === true || interaction.member.roles.cache.some(r => r.id === discordBotTrusted) === true){
                const staffIGN = interaction.options.getString('ign');
                const staffsList = JSON.parse(nodeFS.readFileSync(process.env.STAFFS_LIST_FILE));
                if(staffsList.staffs.includes(staffIGN) === true){
                    const ingameChatChannel = '#' + interaction.guild.channels.cache.get(configValue.discord_channels.ingame_chat).name;
                    ingameBot.chat('/staffstats ' + staffIGN);
                    interaction.reply({ content: '```Running /staffstats ' + staffIGN + ' | Check ' + ingameChatChannel + ' for result.```', ephemeral: true });
                } else {
                    interaction.reply({ content: '```' + staffIGN + ' is not on the staff team.```', ephemeral: true });
                }
            } else {
                interaction.reply({ content: '```You are not allowed to run this command!```', ephemeral: true });
            }
		} else if(commandType === "Message"){
			if(args[0] && !args[1]){
                if(interaction.member.roles.cache.some(r => r.id === discordBotAdmin) === true){
                    const staffsList = JSON.parse(nodeFS.readFileSync(process.env.STAFFS_LIST_FILE));
                    if(staffsList.staffs.includes(args[0]) === true){
                        const ingameChatChannel = '#' + interaction.guild.channels.cache.get(configValue.discord_channels.ingame_chat).name;
                        ingameBot.chat('/staffstats ' + args[0]);
                        interaction.reply('```Running /staffstats ' + args[0] + ' | Check ' + ingameChatChannel + ' for result.```');
                    } else {
                        interaction.reply('```' + args[0] + ' is not on the staff team.```');
                    }
                } else {
                    interaction.reply('```You are not allowed to run this command!```');
                }
            } else {
                interaction.reply('```Invalid Command Usage. Usage: ' + discordBotPrefix + 'staffstats (IGN)```');
            }
		}
	},
};