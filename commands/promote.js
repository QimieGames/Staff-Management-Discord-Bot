const { SlashCommandBuilder } = require('@discordjs/builders');

const nodeFS = require('fs');

const configValue = JSON.parse(nodeFS.readFileSync(process.env.CONFIG_FILE));

const discordBotAdmin = configValue.roles_id.admin;

const discordBotPrefix = configValue.discord_bot.prefix;

const validStaffRanks = ["Trials", "Helper", "Mod", "SrMod"];

const validPromoteRanks = ["Helper", "Mod", "SrMod"];

function isPromoteValid(rankBefore, rankAfter){
    if(rankBefore < validStaffRanks.indexOf(rankAfter)){
        return true;
    } else {
        return false;
    }
    
}

function promoteStaff(staffIGN, staffRankAfter, staffGamemode){
    const editedStaffData = 

    {
        ingame_name: staffIGN,
        staff_rank: staffRankAfter,
        staff_gamemode: staffGamemode
    }
    nodeFS.writeFileSync(process.env.INDIVIDUAL_STAFF_DIR + `${staffIGN}.json`, JSON.stringify(editedStaffData, null, 4), 'utf-8');
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('promote')
		.setDescription('Promote a staff member. [Admin Command]')
        .addStringOption(option => 
            option.setName('ign')
            .setDescription('Staff Ingame Name.')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('rank')
            .setDescription('Rank To Promote Said Staff To.')
            .setRequired(true)
            .addChoices({ 'name': 'Helper', 'value': 'Helper' })
            .addChoices({ 'name': 'Mod', 'value': 'Mod' })
            .addChoices({ 'name': 'SrMod', 'value': 'SrMod' })),

	async execute(interaction, commandType, args) {
		if(commandType === "Slash"){
            if(interaction.member.roles.cache.some(r => r.id === discordBotAdmin) === true){
                const staffIGN = interaction.options.getString('ign');
                const staffsList = JSON.parse(nodeFS.readFileSync(process.env.STAFFS_LIST_FILE));
                if(staffsList.staffs.includes(`${staffIGN}`) === true){
                    const staffRankAfter = interaction.options.getString('rank');
                    if(validPromoteRanks.includes(staffRankAfter) === true){
                        const staffData = JSON.parse(nodeFS.readFileSync(process.env.INDIVIDUAL_STAFF_DIR + `${staffIGN}.json`));
                        const staffRankBefore = staffData.staff_rank;
                        const staffGamemode = staffData.staff_gamemode;
                        if(isPromoteValid(staffRankBefore, staffRankAfter) === true){
                            promoteStaff(staffIGN, validStaffRanks.indexOf(staffRankAfter), staffGamemode);
                            await interaction.reply({ content: `Promoted ${staffIGN} to ${staffRankAfter}!`, ephemeral: true });
                        } else {
                            interaction.reply({ content: `Failed to promote ${staffIGN} as this staff already have a higher/same rank as the rank you are trying to promote them to.`, ephemeral: true});
                        }
                    } else {
                        interaction.reply({ content: '```Invalid Rank To Promote To. Ranks: Helper/Mod/SrMod```', ephemeral: true });
                    }
                } else {
                    interaction.reply({ content: '```' + `${staffIGN}` + ' is not on the staff team.```', ephemeral: true });
                }
            } else {
                interaction.reply({ content: '```You are not allowed to run this command!```', ephemeral: true });
            }
		} else if(commandType === "Message"){
            if(args[1] && !args[2]){
			    if(interaction.member.roles.cache.some(r => r.id === discordBotAdmin) === true){
                    const staffsList = JSON.parse(nodeFS.readFileSync(process.env.STAFFS_LIST_FILE));
                    if(staffsList.staffs.includes(`${args[0]}`) === true){
                        if(validPromoteRanks.includes(args[1]) === true){
                            const staffData = JSON.parse(nodeFS.readFileSync(process.env.INDIVIDUAL_STAFF_DIR + `${args[0]}.json`));
                            const staffRankBefore = staffData.staff_rank;
                            const staffGamemode = staffData.staff_gamemode;
                            if(isPromoteValid(staffRankBefore, args[1]) === true){
                                promoteStaff(args[0], validStaffRanks.indexOf(args[1]), staffGamemode);
                                await interaction.reply(`Promoted ${args[0]} to ${args[1]}!`);
                            } else {
                                interaction.reply(`Failed to promote ${args[0]} as this staff already have a higher or same rank as the rank you are trying to promote them to.`);
                            }
                        } else {
                            interaction.reply('```Invalid Rank To Promote To. Ranks: Helper/Mod/SrMod```');
                        }
                    } else {
                        interaction.reply('```' + `${args[0]}` + ' is not on the staff team.```');
                    }
                } else {
                    interaction.reply('```You are not allowed to run this command!```');
                }
            } else {
                interaction.reply('```Invalid Command Usage. Usage: ' + discordBotPrefix + 'promote (IGN) (Rank To Promote To)```');
            }
		}
	},
};