require('dotenv').config();

const { SlashCommandBuilder } = require('@discordjs/builders');

const nodeFS = require('fs');

const configValue = JSON.parse(nodeFS.readFileSync(process.env.CONFIG_FILE));

const discordBotAdmin = configValue.roles_id.admin;

const discordBotPrefix = configValue.discord_bot.prefix;

const validStaffRanks = ["Trials", "Helper", "Mod", "SrMod"];

const fullRanksList = ["Member", "Trials", "Helper", "Mod", "SrMod"];

const validDemoteRanks = ["Member", "Helper", "Mod"];

let updatedStaffsList =

{
    staffs: []
};

function isDemoteValid(rankBefore, rankAfter){ 
    rankBefore = fullRanksList.indexOf(rankBefore);
    rankAfter = fullRanksList.indexOf(rankAfter);
    if(rankBefore > rankAfter){
        return true;
    } else {
        return false;
    }
}

function updateStaffList(){
    nodeFS.writeFileSync(process.env.STAFFS_LIST_FILE, JSON.stringify(updatedStaffsList, null, 4), 'utf-8');
}

function loadIndividualStaffFile(){
    const staffsList = JSON.parse(nodeFS.readFileSync(process.env.STAFFS_LIST_FILE));
    staffsList.staffs.forEach(staff => {
        try{
            nodeFS.accessSync(process.env.INDIVIDUAL_STAFF_DIR + `${staff}.json`, nodeFS.constants.F_OK);
            updatedStaffsList.staffs.push(`${staff}`);
        } catch {
            if(updateStaffList() === false){
                process.exit(0);
            }
        }
    });
    updatedStaffsList.staffs = [];
}

function removeStaffIndividualFile(staff){
    try{
        nodeFS.rmSync(process.env.INDIVIDUAL_STAFF_DIR + `${staff}.json`);
        return true;
    } catch {
        return false;
    }
}

function demoteStaff(staffIGN, staffRankAfter, staffGamemode){
    if(staffRankAfter === 'Member'){
        if(removeStaffIndividualFile(staffIGN) === true){
            loadIndividualStaffFile();
            return true;
        } else {
            return false;
        }
    } else if(staffRankAfter === 'Helper' || staffRankAfter === 'Mod'){
        const newStaffData =
        {
            ingame_name: staffIGN,
            staff_rank: validStaffRanks.indexOf(staffRankAfter),
            staff_gamemode: staffGamemode
        };
        nodeFS.writeFileSync(process.env.INDIVIDUAL_STAFF_DIR + `${staffIGN}.json`, JSON.stringify(newStaffData, null, 4), 'utf-8');
        return true;
    }
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('demote')
		.setDescription('Demote a staff member. [Admin Command]')
        .addStringOption(option => 
            option.setName('ign')
            .setDescription('Staff Ingame Name.')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('rank')
            .setDescription('Rank To Demote Said Staff To.')
            .setRequired(true)
            .addChoices({ 'name': 'Member', 'value': 'Member' })
            .addChoices({ 'name': 'Helper', 'value': 'Helper' })
            .addChoices({ 'name': 'Mod', 'value': 'Mod' })),

	async execute(interaction, commandType, args) {
		if(commandType === "Slash"){
            if(interaction.member.roles.cache.some(r => r.id === discordBotAdmin) === true){
                const staffIGN = interaction.options.getString('ign');
                const staffsList = JSON.parse(nodeFS.readFileSync(process.env.STAFFS_LIST_FILE));
                if(staffsList.staffs.includes(`${staffIGN}`) === true){
                    const staffRankAfter = interaction.options.getString('rank');
                    if(validDemoteRanks.includes(staffRankAfter) === true){
                        const staffData = JSON.parse(nodeFS.readFileSync(process.env.INDIVIDUAL_STAFF_DIR + `${staffIGN}.json`));
                        const rankBefore = validStaffRanks[staffData.staff_rank];
                        const staffGamemode = staffData.staff_gamemode;
                        if(isDemoteValid(rankBefore, staffRankAfter) === true){
                            if(demoteStaff(staffIGN, staffRankAfter, staffGamemode) === true){
                                await interaction.reply({ content: '```Demoted ' + staffIGN + ' to ' + staffRankAfter + '!```', ephemeral: true });
                            } else {
                                await interaction.reply({ content: '```Error occured while demoting ' + staffRankAfter + '!```', ephemeral: true });
                            }
                        } else {
                            interaction.reply({ content: '```Failed to demote ' + staffIGN + ' as this staff already have the same rank as the rank you are trying to demote them to or you are trying to demote them to a higher rank.```', ephemeral: true });
                        }
                    } else {
                        interaction.reply('```Invalid Rank To Promote To. Ranks: Member/Helper/Mod```');
                    }
                } else{
                    interaction.reply('```' + `${staffIGN}` + ' is not on the staff team.```');
                }
            } else {
                interaction.reply('```You are not allowed to run this command!```');
            }
		} else if(commandType === "Message"){
            if(args[1] && !args[2]){
                if(interaction.member.roles.cache.some(r => r.id === discordBotAdmin) === true){
                    const staffsList = JSON.parse(nodeFS.readFileSync(process.env.STAFFS_LIST_FILE));
                    if(staffsList.staffs.includes(`${args[0]}`) === true){
                        if(validDemoteRanks.includes(args[1]) === true){
                            const staffData = JSON.parse(nodeFS.readFileSync(process.env.INDIVIDUAL_STAFF_DIR + `${args[0]}.json`));
                            const rankBefore = validStaffRanks[staffData.staff_rank];
                            const staffGamemode = staffData.staff_gamemode;
                            if(isDemoteValid(rankBefore, args[1]) === true){
                                if(demoteStaff(args[0], args[1], staffGamemode) === true){
                                    await interaction.reply('```Demoted ' + args[0] + ' to ' + args[1] + '```');
                                } else {
                                    await interaction.reply('```Error occured while demoting ' + args[1] + '```');
                                }
                            } else {
                                interaction.reply('```Failed to demote ' + args[0] + ' as this staff already have the same rank as the rank you are trying to demote them to or you are trying to demote them to a higher rank.```');
                            }
                        } else {
                            interaction.reply('```Invalid Rank To Promote To. Ranks: Member/Helper/Mod```');
                        }
                    } else{
                        interaction.reply('```' + `${args[0]}` + ' is not on the staff team.```');
                    }
                } else {
                        interaction.reply('```You are not allowed to run this command!```');
                }
            } else {
                interaction.reply('```Invalid Command Usage. Usage: ' + discordBotPrefix + 'demote (IGN) (Rank To Demote To)```');
            }
		}
	},
};