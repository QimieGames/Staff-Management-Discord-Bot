const { SlashCommandBuilder } = require('@discordjs/builders');

const nodeFS = require('fs');

const configValue = JSON.parse(nodeFS.readFileSync(process.env.CONFIG_FILE));

const discordBotAdmin = configValue.roles_id.admin;

const discordBotPrefix = configValue.discord_bot.prefix;

const validStaffGamemodes = ["Global", "Prison", "Skyblock", "Survival"];

const validStaffRanks = ["Trials", "Helper", "Mod", "SrMod"];

let updatedStaffsList = 

{
    staffs: []
};

function updateStaffList(){
    nodeFS.writeFileSync(process.env.STAFFS_LIST_FILE, JSON.stringify(updatedStaffsList, null, 4), 'utf-8');
}

function addNewStaff(staffIGN, staffGamemode, staffRank){

    const staffsList = JSON.parse(nodeFS.readFileSync(process.env.STAFFS_LIST_FILE));

    const newStaffData = 

        {
            ingame_name: staffIGN,
            staff_rank: validStaffRanks.indexOf(staffRank),
            staff_gamemode: validStaffGamemodes.indexOf(staffGamemode)
        };

    try{
        nodeFS.writeFileSync(process.env.INDIVIDUAL_STAFF_DIR + `${staffIGN}.json`, JSON.stringify(newStaffData, null, 4), 'utf-8');
        updatedStaffsList.staffs.push(staffIGN);
        staffsList.staffs.forEach(staff => {
            updatedStaffsList.staffs.push(`${staff}`);
        });
        updateStaffList();
        updatedStaffsList.staffs = [];
        return true;
    } catch {
        return false;
    }
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addstaff')
		.setDescription('Add a new player to the staff team. [Admin Command]')
        .addStringOption(option =>
            option.setName('ign')
            .setDescription('Staff Ingame Name.')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('gamemode')
            .setDescription('Staff Gamemode.')
            .setRequired(true)
            .addChoices({ 'name': 'Global', 'value': 'Global' })
            .addChoices({ 'name': 'Prison', 'value': 'Prison' })
            .addChoices({ 'name': 'Skyblock', 'value': 'Skyblock' })
            .addChoices({ 'name': 'Survival', 'value': 'Survival' }))
        .addStringOption(option => 
            option.setName('rank')
            .setDescription('Staff Rank.')
            .setRequired(false)
            .addChoices({ 'name': 'Trials', 'value': 'Trials' })
            .addChoices({ 'name': 'Helper', 'value': 'Helper' })
            .addChoices({ 'name': 'Mod', 'value': 'Mod' })
            .addChoices({ 'name': 'SrMod', 'value': 'SrMod' })),
		
	async execute(interaction, commandType, args) {
        if(commandType === "Slash"){
                if(interaction.member.roles.cache.some(r => r.id === discordBotAdmin) === true){
                    const staffIGN = interaction.options.getString('ign');
                    const staffsList = JSON.parse(nodeFS.readFileSync(process.env.STAFFS_LIST_FILE));
                    if(staffsList.staffs.includes(`${staffIGN}`) === false){
                        const staffGamemode = interaction.options.getString('gamemode');
                        if(validStaffGamemodes.includes(staffGamemode) === true){
                            const staffRank = interaction.options.getString('rank');
                            if(staffRank){
                                if(validStaffRanks.includes(`${staffRank}`) === true){
                                    if(addNewStaff(staffIGN, staffGamemode, staffRank) === true){
                                        interaction.reply({ content: '```Successfully added ' + `${staffIGN}` + ' to the staff team```', ephemeral: true });
                                    } else {
                                        interaction.reply({ content: '```Error occured while adding ' + `${staffIGN}` + ' to the staff team!```', ephemeral: true });
                                    }
                                } else {
                                    interaction.reply({ content: '```Invalid Staff Rank. Staff Ranks: Trials/Helper/Mod/SrMod```', ephemeral: true });
                                }
                            } else {
                                if(addNewStaff(staffIGN, staffGamemode, 'Trials') === true){
                                    interaction.reply({ content: '```Successfully added ' + `${staffIGN}` + ' to the staff team```', ephemeral: true });
                                } else {
                                    interaction.reply({ content: '```Error occured while adding ' + `${staffIGN}` + ' to the staff team!```', ephemeral: true });
                                }
                            }
                        } else {
                            interaction.reply({ content: '```Invalid Gamemode. Gamemodes: Global/Prison/Skyblock/Survival```', ephemeral: true });
                        }
                    } else {
                        interaction.reply({ content: '```' + `${args[0]}` + ' is already on the staff team.```', ephemeral: true });
                    }
                } else {
                    interaction.reply({ content: '```You are not allowed to run this command!```', ephemeral: true });
                }
        } else if(commandType === "Message"){
            if(args[1] && !args[3]){
                if(interaction.member.roles.cache.some(r => r.id === discordBotAdmin) === true){
                    const staffsList = JSON.parse(nodeFS.readFileSync(process.env.STAFFS_LIST_FILE));
                    if(staffsList.staffs.includes(`${args[0]}`) === false){
                        if(validStaffGamemodes.includes(args[1]) === true){
                            if(args[2]){
                                if(validStaffRanks.includes(`${args[2]}`) === true){
                                    if(addNewStaff(args[0], args[1], args[2]) === true){
                                        interaction.reply('```Successfully added ' + `${args[0]}` + ' to the staff team```');
                                    } else {
                                        interaction.reply('```Error occured while adding ' + `${args[0]}` + ' to the staff team!```');
                                    }
                                } else {
                                    interaction.reply('```Invalid Staff Rank. Staff Ranks: Trials/Helper/Mod/SrMod```');
                                }
                            } else {
                                if(addNewStaff(args[0], args[1], 'Trials') === true){
                                    interaction.reply('```Successfully added ' + `${args[0]}` + ' to the staff team```');
                                } else {
                                    interaction.reply('```Error occured while adding ' + `${args[0]}` + ' to the staff team!```');
                                }
                            }
                        } else {
                            interaction.reply('```Invalid Gamemode. Gamemodes: Global/Prison/Skyblock/Survival```');
                        }
                    } else {
                        interaction.reply('```' + `${args[0]}` + ' is already on the staff team.```');
                    }
                } else {
                    interaction.reply('```You are not allowed to run this command!```');
                }
            } else {
                interaction.reply('```Invalid Command Usage. Usage: ' + discordBotPrefix + 'addstaff (IGN) (Gamemode) (Rank)```');
            }
        }
    },
};