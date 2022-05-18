require('dotenv').config();

const nodeFS = require('fs');

const envDefaultSettings = 

'DISCORD_BOT_TOKEN=DISCORD_BOT_TOKEN\n' +
'INGAME_BOT_EMAIL=INGAME_BOT_EMAIL\n' +
'INGAME_BOT_PASSWORD=INGAME_BOT_PASSWORD\n' +
'INDIVIDUAL_STAFF_DIR=./staffs/individual/\n' +
'STAFFS_LIST_DIR=./staffs/\n' +
'STAFFS_LIST_FILE=./staffs/list.json';

const staffsListDefaultSettings = 

{
    staffs: []
};

const configDefaultSettings = 

{
    ingame_bot: {
      server_ip: "",
      server_version: ""
    },
    
    discord_bot: {
      guild_id: "",
      client_id: "",
      prefix: ""
    },
    
    discord_channels: {
      trials_list: "",
      trials_changelog: "",
      trials_voting: "",
      trials_stats: "",
      ingame_chat: ""
    },
    
    features: {
      log_ingame_chat: "",
      console_chat: ""
    },

    roles_id: {
      admin: "",
      trusted: "",
      changelog_ping: "",
      voting_ping: "",
      discussion_ping: ""
    }
};

let updatedStaffsList = 

{
    staffs: []
};

const validStaffGamemodes = ["Prisons", "Skyblock", "Survival", "Global"];

const validStaffRanks = ["Trials", "Helper", "Mod", "SrMod"];

function isFirstTimeRun(){
    try{
        nodeFS.accessSync('.env', nodeFS.constants.F_OK);
        if(process.env.DISCORD_BOT_TOKEN === "DISCORD_BOT_TOKEN" || process.env.INGAME_BOT_EMAIL === "INGAME_BOT_EMAIL" || process.env.INGAME_BOT_PASSWORD === "INGAME_BOT_PASSWORD"){
            return true;
        }
        return false;
    } catch {
        return true;
    }
}

function performFirstTimeRun(){
    try{
        console.log('[SMDB] Executing first time run...');
        nodeFS.writeFileSync('.env', envDefaultSettings, 'utf-8');
        nodeFS.mkdirSync('./settings/');
        nodeFS.writeFileSync('./settings/config.json', JSON.stringify(configDefaultSettings, null, 4), 'utf-8');
        return true;
    } catch {
        return false;
    }
}

function loadStaffsListFile(){
    try{
        nodeFS.accessSync(process.env.STAFFS_LIST_FILE, nodeFS.constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

function createStaffsList(){
    try{
        nodeFS.mkdirSync(process.env.STAFFS_LIST_DIR);
        nodeFS.mkdirSync(process.env.INDIVIDUAL_STAFF_DIR);
        nodeFS.writeFileSync(process.env.STAFFS_LIST_FILE, JSON.stringify(staffsListDefaultSettings, null, 4), 'utf-8');
        return true;
    } catch {
        return false;
    }
}

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

function loadIndividualStaffData(){
    const staffsList = JSON.parse(nodeFS.readFileSync(process.env.STAFFS_LIST_FILE));
    staffsList.staffs.forEach(staff => {
        let individualStaffData = JSON.parse(nodeFS.readFileSync(process.env.INDIVIDUAL_STAFF_DIR + `${staff}.json`));
        console.log(`[SMDB] Loading individual staff's data for ${staff}...`);
        if(Number.isInteger(individualStaffData.staff_rank) === true && Number.isInteger(individualStaffData.staff_gamemode) === true && individualStaffData.ingame_name === staff && individualStaffData.staff_rank <= 3 && individualStaffData.staff_rank >= 0 && individualStaffData.staff_gamemode >= 0 && individualStaffData.staff_gamemode <= 3){
            console.log(`[SMDB] Successfully loaded individual staff's data for ${staff}!`); 
            updatedStaffsList.staffs.push(`${staff}`);
        } else {
            console.log(`[SMDB] Error occured while loading individual staff's data for ${staff}! Removing ${staff} from staffs list...`);
            if(updateStaffList() === false){
                console.log(`[SMDB] Error occured while removing ${staff} from staffs list!`);
                process.exit(0);
            } else {
                console.log(`[SMDB] Successfully removed ${staff} from staffs list!`);
                console.log(`[SMDB] Deleting individual staff's file for ${staff}...`);
                if(removeStaffIndividualFile(`${staff}`) === false){
                    console.log(`[SMDB] Error occured while deleting individual staff's file for ${staff}!`);
                    process.exit(0);
                } else {
                    console.log(`[SMDB] Successfully deleted individual staff's file for ${staff}!`);
                }
            }
        }
    });
    updatedStaffsList.staffs = [];
}

function loadIndividualStaffFile(){
    const staffsList = JSON.parse(nodeFS.readFileSync(process.env.STAFFS_LIST_FILE));
    staffsList.staffs.forEach(staff => {
        try{
            nodeFS.accessSync(process.env.INDIVIDUAL_STAFF_DIR + `${staff}.json`, nodeFS.constants.F_OK);
            console.log(`[SMDB] Successfully loaded individual staff's file for ${staff}!`);
            updatedStaffsList.staffs.push(`${staff}`);
        } catch {
            console.log(`[SMDB] Error occured while loading individual staff's file for ${staff}! Removing ${staff} from staffs list...`);
            if(updateStaffList() === false){
                console.log(`[SMDB] Error occured while removing ${staff} from staffs list!`);
                process.exit(0);
            } else {
                console.log(`[SMDB] Successfully removed ${staff} from staffs list!`);
            }
        }
    });
    updatedStaffsList.staffs = [];
    loadIndividualStaffData();
}

function loadStaffsData(){
    if(loadStaffsListFile() === false){
        console.log("[SMDB] Staffs list doesn't exist! Creating one...");
        if(createStaffsList() === false){
            console.log('[SMDB] Error occured while creating staffs list!');
            process.exit(0);
        } else {
            console.log('[SMDB] Successfully created staffs list!');
        }
    } else {
        const staffsList = JSON.parse(nodeFS.readFileSync(process.env.STAFFS_LIST_FILE));
        console.log('[SMDB] Successfully loaded staffs list!');
        console.log("[SMDB] Loading individual staff's file...");
        if(staffsList.staffs.length === 0){
            console.log("[SMDB] There is no staff on the staff list. No individual staff's data is being loaded.");
        } else {
        loadIndividualStaffFile();
        }
    }
}

console.log('[SMDB] Starting up bot...');

if(isFirstTimeRun() === true){
    if(performFirstTimeRun() === true){
        console.log('[SMDB] Successfully executed first time run! Please close and configure the settings before starting the bot.');
        process.exit(0);
    } else {
        console.log('[SMDB] Error occured while performing first time run!');
        process.exit(0);
    }
} else {
    console.log('[SMDB] Loading staffs list...');
    loadStaffsData();
}