const { SlashCommandBuilder } = require('@discordjs/builders');

const nodeFS = require('fs');

const configValue = JSON.parse(nodeFS.readFileSync(process.env.CONFIG_FILE));

const discordBotAdmin = configValue.roles_id.admin;

const discordBotPrefix = configValue.discord_bot.prefix;

const validVoteRanks = ["Member", "Helper", "Mod", "SrMod"];

const fullRanksList = ["Member", "Trials", "Helper", "Mod", "SrMod"];

const validStaffRanks = ["Trials", "Helper", "Mod", "SrMod"];

const voteYesEmoji = '✅';

const voteNoEmoji = '❌';

function isVoteValid(staffRankBefore, staffRankAfter){
    const staffRankBeforeConverted = fullRanksList.indexOf(validStaffRanks[staffRankBefore]);
    const staffRankAfterConverted = fullRanksList.indexOf(staffRankAfter);
    if(staffRankBeforeConverted === staffRankAfterConverted){
        return false;
    } else {
        return true;
    }
}

function decidePromoteOrDemote(staffRankBefore, staffRankAfter){
    const staffRankBeforeConverted = fullRanksList.indexOf(validStaffRanks[staffRankBefore]);
    const staffRankAfterConverted = fullRanksList.indexOf(staffRankAfter);
    if(staffRankBeforeConverted < staffRankAfterConverted){
        return 'PROMOTION';
    } else if(staffRankBeforeConverted > staffRankAfterConverted){
        return 'DEMOTION';
    }
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('vote')
		.setDescription('Start a promotion/demotion vote on said staff member. [Admin Command]')
        .addStringOption(option => 
            option.setName('ign')
            .setDescription('Staff Ingame Name.')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('rank')
            .setDescription('Rank To Promote/Demote Said Staff To.')
            .setRequired(true)
            .addChoices({ 'name': 'Member', 'value': 'Member' })
            .addChoices({ 'name': 'Helper', 'value': 'Helper' })
            .addChoices({ 'name': 'Mod', 'value': 'Mod' })
            .addChoices({ 'name': 'SrMod', 'value': 'SrMod' })),

	async execute(interaction, commandType, args) {
		if(commandType === "Slash"){
			const staffIGN = interaction.options.getString('ign');
            const staffRankAfter = interaction.options.getString('rank');
            if(interaction.member.roles.cache.some(r => r.id === discordBotAdmin) === true){
                const staffsList = JSON.parse(nodeFS.readFileSync(process.env.STAFFS_LIST_FILE));
                if(staffsList.staffs.includes(`${staffIGN}`) === true){
                    if(validVoteRanks.includes(staffRankAfter) === true){
                        const staffData = JSON.parse(nodeFS.readFileSync(process.env.INDIVIDUAL_STAFF_DIR + `${staffIGN}.json`));
                        const staffRankBefore = staffData.staff_rank;
                        if(isVoteValid(staffRankBefore, staffRankAfter) === true){
                            const votingChannel = '#' + interaction.guild.channels.cache.get(configValue.discord_channels.staff_voting).name;
                            const votingPing = '<@&' + configValue.roles_id.voting_ping + '>';
                            const voteMessage = await interaction.guild.channels.cache.get(configValue.discord_channels.staff_voting).send('|| ' + votingPing + ' ||' + '```[' + decidePromoteOrDemote(staffRankBefore, staffRankAfter) + `] ${staffIGN} | ` + validStaffRanks[staffRankBefore] + ' -> ' + staffRankAfter + '```');
                            voteMessage.react(voteYesEmoji);
                            voteMessage.react(voteNoEmoji);
                            interaction.reply({ content: '```Started a vote on ' + staffIGN + ' in ' + votingChannel + '.```', ephemeral: true });
                        } else {
                            interaction.reply({ content: '```Failed to start a vote on ' + staffIGN + ' as this staff already have the same rank as the rank you trying to vote on.```', ephemeral: true });
                        }
                    } else {
                            interaction.reply({ content: '```Invalid Rank To Promote/Demote To. Ranks: Member/Helper/Mod/SrMod```', ephemeral: true });
                    }
                } else {
                    interaction.reply({ content: '```' + staffIGN + ' is not on the staff team.```', ephemeral: true });
                }
            } else {
                interaction.reply({ content: '```You are not allowed to run this command!```', ephemeral: true });
            }
		} else if(commandType === "Message"){
			if(args[1] && !args[2]){
                if(interaction.member.roles.cache.some(r => r.id === discordBotAdmin) === true){
                    const staffsList = JSON.parse(nodeFS.readFileSync(process.env.STAFFS_LIST_FILE));
                    if(staffsList.staffs.includes(`${args[0]}`) === true){
                        if(validVoteRanks.includes(args[1]) === true){
                            const staffData = JSON.parse(nodeFS.readFileSync(process.env.INDIVIDUAL_STAFF_DIR + `${args[0]}.json`));
                            const staffRankBefore = staffData.staff_rank;
                            if(isVoteValid(staffRankBefore, args[1]) === true){
                                const votingChannel = '#' + interaction.guild.channels.cache.get(configValue.discord_channels.staff_voting).name;
                                const votingPing = '<@&' + configValue.roles_id.voting_ping + '>';
                                const voteMessage = await interaction.guild.channels.cache.get(configValue.discord_channels.staff_voting).send('|| ' + votingPing + ' ||' + '```[' + decidePromoteOrDemote(staffRankBefore, args[1]) + `] ${args[0]} | ` + validStaffRanks[staffRankBefore] + ' -> ' + `${args[1]}` + '```');
                                voteMessage.react(voteYesEmoji);
                                voteMessage.react(voteNoEmoji);
                                interaction.reply('```Started a vote on ' + args[0] + ' in ' + votingChannel + '.```');
                            } else {
                                interaction.reply('```Failed to start a vote on ' + args[0] + ' as this staff already have the same rank as the rank you trying to vote on.```');
                            }
                        } else {
                            interaction.reply('```Invalid Rank To Promote/Demote To. Ranks: Member/Helper/Mod/SrMod```');
                        }
                    } else {
                        interaction.reply('```' + args[0] + ' is not on the staff team.```');
                    }
                } else {
                    interaction.reply('```You are not allowed to run this command!```');
                }
            } else {
                interaction.reply('```Invalid Command Usage. Usage: ' + discordBotPrefix + 'vote (IGN) (Rank To Promote/Demote To)```');
            }
		}
	},
};