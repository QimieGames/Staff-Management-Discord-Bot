require('dotenv').config();

const {constants, readFileSync, appendFileSync, accessSync, rmSync, writeFileSync, readFile} = require('fs');

const YAML = require('js-yaml');

const {Client, Intents, MessageEmbed, Collection} = require('discord.js');

//const { REST } = require('@discordjs/rest');

//const { Routes } = require('discord-api-types/v9');

//const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_BOT_TOKEN);

const mineflayer = require('mineflayer');

const wait = require('node:timers/promises').setTimeout;

const discordBotIntents = [
  Intents.FLAGS.GUILD_MEMBERS,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.GUILDS
];

const discordBot = new Client({intents: discordBotIntents});

const config = YAML.load(readFileSync(process.env.CONFIG_FILE));

staffsList = JSON.parse(readFileSync(process.env.STAFF_TEAM_LIST_FILE).toString());

let ingameBotConfig = {
    host: config.ingame_bot.server_ip,
    username: process.env.INGAME_BOT_EMAIL, 
    password: process.env.INGAME_BOT_PASSWORD, 
    auth: process.env.AUTH_WAY,
    version: config.ingame_bot.server_version
};

const ingameBot = mineflayer.createBot(ingameBotConfig);

const discordBotPrefix = config.discord_bot.prefix;
const discordBotAdmin = config.roles_id.admin;
const discordBotTrusted = config.roles_id.trusted;

/*const commandFiles = readdirSync('./commands').filter(file => file.endsWith('.js'));

const commands = [];

discordBot.commands = new Collection();

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    discordBot.commands.set(command.data.name, command);
}*/

console.log("[Discord] Connecting to the Discord bot...");

discordBot.login(process.env.DISCORD_BOT_TOKEN);

/*rest.put(Routes.applicationGuildCommands(config.discord_bot.client_id, config.discord_bot.guild_id), { body: commands })
	.then(() => console.log('[Discord] Successfully registered slash commands.'))
	.catch(console.error);
    
    (async () => {
        try {
            console.log('[Discord] Refreshing slash commands.');
    
            await rest.put(
                Routes.applicationGuildCommands(config.discord_bot.client_id, config.discord_bot.guild_id),
                { body: commands },
            );
    
            console.log('[Discord] Successfully reloaded slash commands.');
        } catch (error) {
            console.error(error);
        }
    })();*/

const helpMenuEmbed = new MessageEmbed()
	.setColor('#25c42b')
	.setTitle('COMMANDS LIST')
	.setURL('https://mchub.com/')
	.setDescription(discordBotPrefix + 'help = Shows this menu.\n\n' + discordBotPrefix + "stats (IGN) = Check a staff member's staffstats.\n\n" + discordBotPrefix + 'vote (IGN) (Rank To Promote/Demote To) = Start a promotion/demotion vote on said staff member. [Admin Command]\n\n' + discordBotPrefix + 'promote (IGN) (Rank To Promote To) = Promote a staff member. [Admin Command]\n\n' + discordBotPrefix + 'demote (IGN) (Rank To Demote To) = Demote a staff member. [Admin Command]\n\n' + discordBotPrefix + 'addstaff (IGN) (Gamemode) (Rank) = Add a new player to the staff team. [Admin Command]\n\n' + discordBotPrefix + "editstaff (IGN) (New IGN) (New Rank) (New Gamemode) = Edit a staff member's details. [Admin Command]\n\n" + discordBotPrefix + 'removestaff (IGN) = Remove a staff member from the staff team. [Admin Command]\n\n' + discordBotPrefix + 'sudo (Command) = Run a command ingame. [Admin Command]\n\n' + discordBotPrefix + 'restart = Restart the bot. [Admin Command]')
	.setThumbnail('https://i.imgur.com/3ovjQst.png')
	.setTimestamp()
	.setFooter({text: 'Custom Coded By QimieGames', iconURL: 'https://i.imgur.com/io8hIIm.png'});

function loadIndividualStaffData(staff){
    let individualStaffData = JSON.parse(readFileSync(process.env.INDIVIDUAL_STAFF_DIR + `${staff}.json`).toString());
    let updatedStaffsList = [];
    console.log(`[Data Manager] Loading staff data for ${staff}...`);
    if(Number.isInteger(individualStaffData.staff_rank) === true && individualStaffData.ingame_name === staff && individualStaffData.staff_rank <= 4 && individualStaffData.staff_rank >= 1 && individualStaffData.gamemode >= 1 && individualStaffData.gamemode <= 4){
        updatedStaffsList.push(`${staff}`);
        console.log(`[Data Manager] Successfully loaded staff data for ${staff}!`);
    } else {
        console.log(`[Data Manager] Staff data for ${staff} is invalid! Removing ${staff}'s data and from staff team list...`);
        rmSync(process.env.INDIVIDUAL_STAFF_DIR + `${staff}.json`, { 'force': true, 'recursive': true });
        writeFileSync(process.env.STAFF_TEAM_LIST_FILE, JSON.stringify(updatedStaffsList, null, 2));
        console.log(`[Data Manager] Removed ${staff}'s data and from staff team list.`);
    }
    
}

function loadIndividualStaffFile(){
    let updatedStaffsList = [];
    staffsList.forEach(staff => {
        console.log(`[Data Manager] Loading staff file for ${staff}...`);
        try{  
            accessSync(process.env.INDIVIDUAL_STAFF_DIR + `${staff}.json`, constants.F_OK);
            console.log(`[Data Manager] Successfully loaded staff file for ${staff}!`);
            updatedStaffsList.push(`${staff}`);
            return loadIndividualStaffData(`${staff}`);
        } catch {
            console.log(`[Data Manager] Staff file for ${staff} doesn't exist! Removing ${staff} from staff team list...`);
            rmSync(process.env.INDIVIDUAL_STAFF_DIR + `${staff}.json`, { 'force': true, 'recursive': true });
            writeFileSync(process.env.STAFF_TEAM_LIST_FILE, JSON.stringify(updatedStaffsList, null, 2));
            console.log(`[Data Manager] Removed ${staff} from staff team list.`);
        }
    });
}

function loadStaffData(){
    console.log("[Data Manager] Loading staff team list...");
    try{  
        accessSync(process.env.STAFF_TEAM_LIST_FILE, constants.F_OK);
        console.log("[Data Manager] Successfully loaded staff team list!");
        return loadIndividualStaffFile();
    } catch {
        const defaultStaffTeamFile = '{ "staffs": [] }';
        console.log("[Data Manager] Staff team list doesn't exist! Creating one...");
        appendFileSync(process.env.STAFF_TEAM_LIST_FILE, defaultStaffTeamFile);
        console.log("[Data Manager] Staff team list created.");
    }
}

function removeStaff(staff){
    let updatedStaffsList = [];
    rmSync(process.env.INDIVIDUAL_STAFF_DIR + `${staff}.json`, { 'force': true, 'recursive': true });
    staffsList.forEach(staffList => {
        try{  
            accessSync(process.env.INDIVIDUAL_STAFF_DIR + `${staffList}.json`, constants.F_OK);
            updatedStaffsList.push(`${staffList}`);
        } catch {
            console.log(`[Data Manager] Removing ${staffList} from the staff team...`);
            rmSync(process.env.INDIVIDUAL_STAFF_DIR + `${staffList}.json`, { 'force': true, 'recursive': true });
            writeFileSync(process.env.STAFF_TEAM_LIST_FILE, JSON.stringify(updatedStaffsList, null, 2));
            console.log(`[Data Manager] Removed ${staffList} from staff team.`);
        }
    });
}

function addStaff(IGN, Gamemode, Rank){

    staffRanks = ["Trials", "Helper", "Mod", "SrMod"];
    staffGamemodes = ["Prisons", "Skyblock", "Survival", "Global"];

    staffRank = staffRanks.indexOf(Rank);
    staffGamemode = staffGamemodes.indexOf(Gamemode);

    newStaffDetails = "{\n\n" +

        `"ingame_name":"${IGN}",\n`
        + `"staff_rank":${staffRank},\n`
        + `"gamemode":${staffGamemode}\n\n`
    
    + "}";

    writeFileSync(process.env.INDIVIDUAL_STAFF_DIR + `${IGN}.json`, newStaffDetails);

    let updatedStaffsList = [];

    staffsList.forEach(staff => {
        updatedStaffsList.push(staff);
    });

    updatedStaffsList.push(IGN);

    writeFileSync(process.env.STAFF_TEAM_LIST_FILE, JSON.stringify(updatedStaffsList, null, 2));
}

discordBot.once('ready', () => {
    console.log("[Discord] Successfully connected to the Discord bot!");
    discordBot.user.setActivity(config.ingame_bot.server_ip, {type: 'STREAMING', url: 'https://www.twitch.tv/officialqimiegames'});
    loadStaffData();
});

process.on('unhandledRejection', reason => {
  if (reason.code == 'TOKEN_INVALID'){
    console.log("\n[Discord] Invalid Discord Bot Token!\n");
    process.exit(0);
  } else {
    console.log(reason.code);
    process.exit(0);
  }
});

ingameBot.on('error', (reason) => {
  console.log(reason);
  process.exit(0);

});

ingameBot.on('kicked', (reason) => {
    console.log(reason);
    process.exit(0);
});

ingameBot.on('message', chatMSG => {
    if(config.features.console_chat === "true"){
    console.log(chatMSG.toAnsi());
    }
    if(config.features.log_ingame_chat === "true"){
        if (chatMSG.length() > 2) {
            discordBot.channels.cache.get(config.discord_channels.ingame_chat).send("```" + chatMSG + "```");
        }
    }
});

discordBot.on('messageCreate', discordMessage => {
    
    if(!discordMessage.content.startsWith(discordBotPrefix) || discordMessage.author.bot) return;

    const args = discordMessage.content.slice(discordBotPrefix.length).split(/ +/);
    const discordCommand = args.shift().toLocaleLowerCase();

    switch(discordCommand){
        default:
                discordMessage.reply("```Invalid Command. Do " + discordBotPrefix + "help for list of commands.```");
            break;
        case 'help':
            if(args[0]){
                discordMessage.reply("```Invalid Command Usage. Usage: " + discordBotPrefix + "help```");
            } else {
                    discordMessage.reply({embeds: [helpMenuEmbed]});
            }
            break;
        case 'addstaff':
            if(!args[0] || !args[1] || !args[2] || args[3]){
                discordMessage.reply("```Invalid Command Usage. Usage: " + discordBotPrefix + "addstaff (IGN) (Gamemode) (Rank)```");
            } else {
                if(discordMessage.member.roles.cache.has(`${discordBotAdmin}`) === true){
                    if(staffsList.find(staff => staff === args[0]) === args[0]){
                        discordMessage.reply(args[0] + " is already on the staff team.");
                    } else {
                        const validGamemodeOptions = ["Prisons", "Skyblock", "Survival", "Global"];
                        if(validGamemodeOptions.find(gamemodeOptions => gamemodeOptions === args[1]) !== args[1]){
                            discordMessage.reply("Invalid Gamemode. Gamemodes: Prisons/Skyblock/Survival/Global");
                        } else {
                            const validStaffRanks = ["Trials", "Helper", "Mod", "SrMod"];
                            if(validStaffRanks.find(staffRankOptions => staffRankOptions === args[2]) !== args[2]){
                                discordMessage.reply("Invalid Staff Rank. Staff Ranks: Trials/Helper/Mod/SrMod");
                            } else {
                                addStaff(args[0], args[1], args[2]);
                                discordMessage.reply("Added " + args[0] + " to the staff team as " + args[1] + " " + args[2] + ".");
                            }
                        }
                    }
                } else {
                    discordMessage.reply("```You are not allowed to run this command.```");
                }
            }
            break;
        case 'removestaff':
            if(!args[0] || args[1]){
                discordMessage.reply("```Invalid Command Usage. Usage: " + discordBotPrefix + "removestaff (IGN)```");
            } else {
                if(discordMessage.member.roles.cache.has(`${discordBotAdmin}`) === true){
                    if(staffsList.find(staff => staff === args[0]) === args[0]){
                        removeStaff(args[0]);
                        discordMessage.reply("Removed " + args[0] + " from the staff team.");
                    } else {
                        discordMessage.reply(args[0] + " is not on the staff team.");
                    }
                } else {
                    discordMessage.reply("```You are not allowed to run this command.```");
                }
            }
            break;
        case 'restart':
            if(args[0]){
                discordMessage.reply("```Invalid Command Usage. Usage: " + discordBotPrefix + "restart```");
            } else {
                if(discordMessage.member.roles.cache.has(`${discordBotAdmin}`) === true){
                    discordMessage.reply("```Restarting...```").then(() => {
                        process.exit(0);
                    });
                } else {
                    discordMessage.reply("```You are not allowed to run this command.```");
                }
            }
            break;
    }


});

/*discordBot.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const command = discordBot.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        if (error) console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});*/