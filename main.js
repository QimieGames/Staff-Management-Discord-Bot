require('dotenv').config();

const nodeFS = require('fs');

const envDefaultSettings = 

'DISCORD_BOT_TOKEN=DISCORD_BOT_TOKEN\n' +
'INGAME_BOT_EMAIL=INGAME_BOT_EMAIL\n' +
'INGAME_BOT_PASSWORD=INGAME_BOT_PASSWORD\n' +
'INDIVIDUAL_STAFF_DIR=./staffs/individual/\n' +
'STAFFS_LIST_FILE=./staffs/list.json';

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
        nodeFS.writeFileSync('./settings/config.json', JSON.stringify(configDefaultSettings, null, 4), 'utf-8');
        return true;
    } catch {
        return false;
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
}