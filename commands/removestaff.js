const { SlashCommandBuilder } = require('@discordjs/builders');

const nodeFS = require('fs');

const configValue = JSON.parse(nodeFS.readFileSync(process.env.CONFIG_FILE));

const discordBotAdmin = configValue.roles_id.admin;

const discordBotPrefix = configValue.discord_bot.prefix;

let staffsList = JSON.parse(nodeFS.readFileSync(process.env.STAFFS_LIST_FILE));

let updatedStaffsList = 

{
    staffs: []
};

function updateStaffList(){
    nodeFS.writeFileSync(process.env.STAFFS_LIST_FILE, JSON.stringify(updatedStaffsList, null, 4), 'utf-8');
}

function removeStaffIndividualFile(staff){
    try{
        nodeFS.rmSync(process.env.INDIVIDUAL_STAFF_DIR + `${staff}.json`);
        return true;
    } catch {
        return false;
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
    updatedStaffsList.staffs = [];
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('removestaff')
		.setDescription('Remove a staff member from the staff team. [Admin Command]')
        .addStringOption(option =>
            option.setName('ign')
            .setDescription('Staff Ingame Name.')
            .setRequired(true)),
		
	async execute(interaction, commandType, args) {
        if(commandType === "Slash"){
            if(interaction.member.roles.cache.some(r => r.id === discordBotAdmin) === true){
                const ingameName = interaction.options.getString('ign');
                if(staffsList.staffs.includes(`${ingameName}`) === true){
                    if(removeStaffIndividualFile(ingameName) === true){
                        loadIndividualStaffFile();
                        await interaction.reply({ content: '```Removed ' + `${ingameName}` + ' from the staff team!```', ephemeral: true });
                    } else {
                        interaction.reply({ content: '```Error occured while removing ' + `${ingameName}` + ' from the staff team.```', ephemeral: true });
                    }
                } else {
                    interaction.reply({ content: '```' + `${ingameName}` + ' is not on the staff team.```', ephemeral: true });
                }
            } else {
                interaction.reply({ content: '```You are not allowed to run this command!```', ephemeral: true });
            }
        } else if(commandType === "Message"){
            if(args[0] && !args[1]){
                if(interaction.member.roles.cache.some(r => r.id === discordBotAdmin) === true){
                    if(staffsList.staffs.includes(`${args[0]}`) === true){
                        if(removeStaffIndividualFile(args[0]) === true){
                            loadIndividualStaffFile();
                            await interaction.reply('```Removed ' + `${args[0]}` + ' from the staff team!```');
                        } else {
                            interaction.reply('```Error occured while removing ' + `${args[0]}` + ' from the staff team.```');
                        }
                    } else {
                        interaction.reply('```' + `${args[0]}` + ' is not on the staff team.```');
                    }
                } else {
                    interaction.reply('```You are not allowed to run this command!```');
                }
            } else {
                interaction.reply('```Invalid Command Usage. Usage: ' + discordBotPrefix + 'removestaff (IGN)```');
            }
        }
    },
};