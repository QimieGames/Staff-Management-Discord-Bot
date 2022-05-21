const { SlashCommandBuilder } = require('@discordjs/builders');

const nodeFS = require('fs');

const validStaffGamemodes = ["Global", "Prison", "Skyblock", "Survival"];

const validStaffRanks = ["Trials", "Helper", "Mod", "SrMod"];

const configValue = JSON.parse(nodeFS.readFileSync(process.env.CONFIG_FILE));

const discordBotAdmin = configValue.roles_id.admin;

const discordBotPrefix = configValue.discord_bot.prefix;

let updatedStaffsList =
{
    staffs: []
};

function isEditValid(oldIGN, newIGN, newGamemode, newRank){
    const staffData = JSON.parse(nodeFS.readFileSync(process.env.INDIVIDUAL_STAFF_DIR + `${oldIGN}.json`));
    const oldRank = staffData.staff_rank;
    const oldGamemode = staffData.staff_gamemode;
    const newGamemodeConverted = validStaffGamemodes.indexOf(newGamemode);
    const newRankConverted = validStaffRanks.indexOf(newRank);
    if(oldIGN === newIGN && oldRank === newRankConverted && oldGamemode === newGamemodeConverted){
        return false;
    } else {
        return true;
    }
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
}

function loadIndividualStaffFile(){
    const staffsList = JSON.parse(nodeFS.readFileSync(process.env.STAFFS_LIST_FILE));
    staffsList.staffs.forEach(staff => {
        try{
            nodeFS.accessSync(process.env.INDIVIDUAL_STAFF_DIR + `${staff}.json`, nodeFS.constants.F_OK);
            updatedStaffsList.staffs.push(`${staff}`);
        } catch {}
    });
}

function updateStaffList(){
    nodeFS.writeFileSync(process.env.STAFFS_LIST_FILE, JSON.stringify(updatedStaffsList, null, 4), 'utf-8');
}

function editStaff(oldIGN, newIGN, newGamemode, newRank){
    const newGamemodeConverted = validStaffGamemodes.indexOf(newGamemode);
    const newRankConverted = validStaffRanks.indexOf(newRank);
    try{
        const newStaffData =

        {
            ingame_name: newIGN,
            staff_rank: newRankConverted,
            staff_gamemode: newGamemodeConverted
        };
        nodeFS.writeFileSync(process.env.INDIVIDUAL_STAFF_DIR + `${newIGN}.json`, JSON.stringify(newStaffData, null, 4), 'utf-8');
        if(oldIGN != newIGN){
            nodeFS.rmSync(process.env.INDIVIDUAL_STAFF_DIR + `${oldIGN}.json`);
        }
        updatedStaffsList.staffs.push(newIGN);
        loadIndividualStaffFile();
        updateStaffList();
        updatedStaffsList.staffs = [];
        return true;
    } catch {
        return false;
    }
}

function isNewIGNValid(newIGN){
    const staffsList = JSON.parse(nodeFS.readFileSync(process.env.STAFFS_LIST_FILE));
    if(staffsList.staffs.includes(newIGN) === true){
        return false;
    } else {
        return true;
    }
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('editstaff')
		.setDescription("Edit a staff member's details. [Admin Command]")
        .addStringOption(option =>
            option.setName('ign')
            .setDescription('Staff Ingame Name.')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('newign')
            .setDescription('New Staff Ingame Name.')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('newgamemode')
            .setDescription('New Staff Gamemode.')
            .setRequired(true)
            .addChoices({ 'name': 'Global', 'value': 'Global' })
            .addChoices({ 'name': 'Prison', 'value': 'Prison' })
            .addChoices({ 'name': 'Skyblock', 'value': 'Skyblock' })
            .addChoices({ 'name': 'Survival', 'value': 'Survival' }))
        .addStringOption(option =>
            option.setName('newrank')
            .setDescription('New Staff Rank.')
            .setRequired(true)
            .addChoices({ 'name': 'Trials', 'value': 'Trials' })
            .addChoices({ 'name': 'Helper', 'value': 'Helper' })
            .addChoices({ 'name': 'Mod', 'value': 'Mod' })
            .addChoices({ 'name': 'SrMod', 'value': 'SrMod' })),
		
	async execute(interaction, commandType, args) {
        if(commandType === "Slash"){
            if(interaction.member.roles.cache.some(r => r.id === discordBotAdmin) === true){
                const oldIGN = interaction.options.getString('ign');
                const staffsList = JSON.parse(nodeFS.readFileSync(process.env.STAFFS_LIST_FILE));
                if(staffsList.staffs.includes(`${oldIGN}`) === true){
                    const newGamemode = interaction.options.getString('newgamemode');
                    if(validStaffGamemodes.includes(newGamemode) === true){
                        const newRank = interaction.options.getString('newrank');
                        if(validStaffRanks.includes(newRank) === true){
                            const newIGN = interaction.options.getString('newign');
                            if(isEditValid(oldIGN, newIGN, newGamemode, newRank) === true){
                                if(isNewIGNValid(newIGN) === true){
                                    if(editStaff(oldIGN, newIGN, newGamemode, newRank) === true){
                                        await interaction.reply({ content: '```Edited staff data for ' + oldIGN + '!```', ephemeral: true });
                                    } else {
                                        await interaction.reply({ content: '```Error occured while editing staff data for ' + oldIGN + '!```', ephemeral: true });
                                    }
                                } else {
                                    interaction.reply({ content: "```You may not change another staff's ingame name to another staff's ingame name.```", ephemeral: true });
                                }
                            } else {
                                interaction.reply({ content: '```What are you trying to edit about ' + oldIGN + ' exactly?```', ephemeral: true });
                            }
                        } else {
                            interaction.reply({ content: '```Invalid Staff Rank. Ranks: Trials/Helper/Mod/SrMod```', ephemeral: true });
                        }
                    } else {
                        interaction.reply({ content: '```Invalid Gamemode. Gamemodes: Global/Prison/Skyblock/Survival```', ephemeral: true });
                    }
                } else {
                    interaction.reply({ content: '```' + `${oldIGN}` + ' is not on the staff team.```', ephemeral: true });
                }
            } else {
                    interaction.reply({ content: '```You are not allowed to run this command!```', ephemeral: true });
            }  
        } else if(commandType === "Message"){
            if(args[3] && !args[4]){
                if(interaction.member.roles.cache.some(r => r.id === discordBotAdmin) === true){
                    const staffsList = JSON.parse(nodeFS.readFileSync(process.env.STAFFS_LIST_FILE));
                    if(staffsList.staffs.includes(`${args[0]}`) === true){
                        if(validStaffGamemodes.includes(args[2]) === true){
                            if(validStaffRanks.includes(args[3]) === true){
                                if(isEditValid(args[0], args[1], args[2], args[3]) === true){
                                    if(isNewIGNValid(newIGN) === true){
                                        if(editStaff(args[0], args[1], args[2], args[3]) === true){
                                            await interaction.reply('```Edited staff data for ' + args[0] + '!```');
                                        } else {
                                            await interaction.reply('```Error occured while editing staff data for ' + args[0] + '!```');
                                        }
                                    } else {
                                        interaction.reply("```You may not change another staff's ingame name to another staff's ingame name.```");
                                    }
                                } else {
                                    interaction.reply('```What are you trying to edit about ' + args[0] + ' exactly?```');
                                }
                            } else {
                                interaction.reply('```Invalid Staff Rank. Ranks: Trials/Helper/Mod/SrMod```');
                            }
                        } else {
                            interaction.reply('```Invalid Gamemode. Gamemodes: Global/Prison/Skyblock/Survival```');
                        }
                    } else {
                        interaction.reply('```' + `${args[0]}` + ' is not on the staff team.```');
                    }
                } else {
                    interaction.reply('```You are not allowed to run this command!```');
                }
            } else {
                interaction.reply('```Invalid Command Usage. Usage: ' + discordBotPrefix + 'editstaff (IGN) (NewIGN) (New Gamemode) (New Rank)```');
            }
        }
    },
};