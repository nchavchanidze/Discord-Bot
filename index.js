const Discord = require('discord.js');
const { token, giphytoken, prefix } = require('./config.json');
const { Client, MessageAttachment, MessageEmbed, MessageReaction } = require('discord.js');
const Canvas = require('canvas');
const bot = new Client();
const cheerio = require('cheerio');
const request = require('request');
const Convert = require('parse-ms')
const GphApiClient = require('giphy-js-sdk-core')
giphy = GphApiClient(giphytoken)

//Version
var version = 'v1.6'

//Command Cooldown
const usedCommandRecently = new Set();

//Bot Startup
bot.on('ready', () => {
    console.log('This bot is online!');
    bot.user.setActivity('You 👂 | !help', { type: 'LISTENING' }).catch(console.error);
});

//Member Join Server Greeting

// Pass the entire Canvas object because you'll need to access its width, as well its context
const applyText = (canvas, text) => {
    const ctx = canvas.getContext('2d');

    // Declare a base size of the font
    let fontSize = 70;

    do {
        // Assign the font to the context and decrement it so it can be measured again
        ctx.font = `${fontSize -= 10}px sans-serif`;
        // Compare pixel width of the text to the canvas minus the approximate avatar size
    } while (ctx.measureText(text).width > canvas.width - 300);

    // Return the result to use in the actual canvas
    return ctx.font;
};

bot.on('guildMemberAdd', async member => {
    const channel = member.guild.channels.cache.find(ch => ch.name === 'general');
    if (!channel) return;

    const canvas = Canvas.createCanvas(700, 250);
    const ctx = canvas.getContext('2d');

    const background = await Canvas.loadImage('./greeting-bg.jpg');
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // ctx.strokeStyle = '#000000';
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Slightly smaller text placed above the member's display name
    ctx.font = '28px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Welcome to the server,', canvas.width / 2.5, canvas.height / 3.5);

    // Add an exclamation point here and below
    ctx.font = applyText(canvas, `${member.displayName}!`);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${member.displayName}!`, canvas.width / 2.5, canvas.height / 1.8);

    ctx.beginPath();
    ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: 'png' }));
    ctx.drawImage(avatar, 25, 25, 200, 200);

    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'channel-logo.png');

    channel.send(`Welcome to the server, ${member}! Please read !rules`, attachment).then(channel.send('!rules'));

});
//XXXX-Member Join Server Greeting-XXXX

//Fake Member Join Command 
bot.on('message', message => {
    if (message.content === '!join') {
        bot.emit('guildMemberAdd', message.member);
    }
});

//Bot Messages
bot.on('message', msg => {
    if (msg.content === "Hello") {
        msg.reply('Hello Friend!');
    }
    else if (msg.content === "გამარჯობა") {
        msg.reply('გაგიმარჯოს!');
    }
    else if (msg.content === "ზდ") {
        msg.reply('ზდ');
    }
    else if (msg.content === "როგორ ხარ?") {
        msg.reply('კარგად შენ? 😊');
    }
    else if (msg.content === "ვინ ხარ?") {
        msg.reply('მე შენი ვირტუალური მეგობარი ვარ 🌞');
    }
    else if (msg.content === "ვინ შეგქმნა?") {
        msg.reply('მე შემქმნა Chavcha-მ 🐣');
    }
});

//Bot Commands
bot.on('message', message => {

    let args = message.content.substring(prefix.length).split(" ");

    switch (args[0]) {
        //Test Command
        case 'ping':
            giphy.search('gifs', { "q": "pong" })
                .then((response) => {
                    var totalResponses = response.data.length;
                    var responseIndex = Math.floor((Math.random() * 10) + 1) % totalResponses;
                    var responseFinal = response.data[responseIndex];


                    message.channel.send('pong!', {
                        files: [responseFinal.images.fixed_height.url]
                    });
                }).catch(() => {
                    message.channel.send('Sorry');
                })
            break;

        //Information Commands
        case 'website':
            giphy.search('gifs', { "q": "glitch" })
                .then((response) => {
                    var totalResponses = response.data.length;
                    var responseIndex = Math.floor((Math.random() * 10) + 1) % totalResponses;
                    var responseFinal = response.data[responseIndex];

                    message.channel.send('https://discord.js.org/', {
                        files: [responseFinal.images.fixed_height.url]
                    });
                }).catch(() => {
                    message.channel.send('Sorry');
                })
            break;
        case 'info':
            if (args[1] === 'version') {
                message.channel.send(version);
            }
            else if (args[1] === "author") {
                message.channel.send('Nikoloz Tchavtchanidze');
            }
            else {
                message.channel.send('არასწორი კომანდი')

            }
            break;

        //Clear Command    
        case 'clear':
            if (!args[1]) return message.reply('Error! Please define 2nd Arg')
            message.channel.bulkDelete(args[1]).catch(err => {
                message.reply('Error');
            });;
            break;
        //Embed Command
        case 'embed':
            const embed = new Discord.MessageEmbed()
                .setTitle('User Information')
                .addField('Player Name', message.author.username)
                .addField('Version', version)
                .addField('Current Server', message.guild.name)
                .setColor(0x0072BB)
                .setThumbnail(message.author.displayAvatarURL())
                .setFooter('Subscribe!')
            message.channel.send(embed);
            break;

        //Help Command
        case 'help':
            const HelpEmbed = new Discord.MessageEmbed()
                .setTitle('❗ ბრძანებების სია')
                .addField('ინფორმაციული ბრძანება', '!info (version, author)')
                .addField('მომხმარებლის სერვერიდან გაგდება', '!kick (@მომხმარებელი)')
                .addField('მომხმარებლის სერვერზე ბანის დადება', '!ban (@მომხმარებელი)')
                .addField('რენდომ სურათი Google-დან', '!image (სურათის თემატიკა)')
                .addField('გამოკითხვის ბრძანება', '!poll (გამოკითხვის თემა)')
                .addField('გაიგეთ ვინ რას უსმეს Spotify-ში', '!spotify (@მომხმარებელი)')
                .setColor(0xff244c)
                .attachFiles(['./commands.png', './channel-logo.png'])
                .setImage('attachment://commands.png')
                .setThumbnail('attachment://channel-logo.png')
                .setFooter('გისურვებთ წარმატებას ✨', 'attachment://channel-logo.png')
            message.channel.send(HelpEmbed);
            break;

        //Rules Command
        case 'rules':
            const RulesEmbed = new Discord.MessageEmbed()
                .setTitle('📃 წესები')
                .addField('დაიცავით ცენზურა')
                .addField('ბლა ბლა ბლუ')
                .addField('ბლუ ბლა ბლა')
                .addField('ბლუ ბლა ბლა')
                .setColor(0x0072BB)
                .attachFiles(['./rules.png', './channel-logo.png'])
                .setImage('attachment://rules.png')
                .setThumbnail('attachment://channel-logo.png')
                .setFooter('გისურვებთ წარმატებას ✨', 'attachment://channel-logo.png')
            message.channel.send(RulesEmbed);
            break;

        //Send Attachment Command
        case 'send':
            const attachment = new MessageAttachment('https://img.freepik.com/free-vector/classic-astronaut-character-with-flat-design_23-2147911112.jpg?size=338&ext=jpg')
            message.channel.send(message.author, attachment);
            break;
        case 'sendlocal':
            const attachment2 = new MessageAttachment('./image.jpg');
            message.channel.send(message.author, attachment2);
            break;
        case 'rulles':
            const attachment3 = new MessageAttachment('./rules.txt');
            message.channel.send(message.author, attachment3);
            break;

        //Kick & Ban Commands
        case 'kick':
            if (usedCommandRecently.has(message.author.id)) {
                message.reply('You cannot use that command just yet! Wait another 30 seconds!');
            }
            else {
                giphy.search('gifs', { "q": "kicked" })
                    .then((response) => {
                        var totalResponses = response.data.length;
                        var responseIndex = Math.floor((Math.random() * 10) + 1) % totalResponses;
                        var responseFinal = response.data[responseIndex];
                        const user = message.mentions.users.first();
                        if (!message.member.roles.cache.find(r => r.name === "BOT")) return message.channel.send('You dont have permission')
                            .then(message => message.delete({ timeout: 5000 })); {
                            if (user) {
                                const member = message.guild.member(user);
                                if (member) {
                                    member.kick('You where Kicked').then(() => {
                                        message.reply(`Sucessfully kicked ${user.tag}`, {
                                            files: [responseFinal.images.fixed_height.url]
                                        });
                                    }).catch(err => {
                                        message.reply('I was Unable to Kick the Member');
                                    });
                                }
                                else {
                                    message.reply("That user isn\'t in this guild")
                                }
                            }
                            else {
                                message.reply('You need to specify a person!');
                            }
                        }
                    });
                usedCommandRecently.add(message.author.id);
                setTimeout(() => {
                    usedCommandRecently.delete(message.author.id)
                }, 30000); //30s
            }
            break;
        case 'ban':
            if (usedCommandRecently.has(message.author.id)) {
                message.reply('You cannot use that command just yet! Wait another 30 seconds!');
            }
            else {
                giphy.search('gifs', { "q": "banned" })
                    .then((response) => {
                        var totalResponses = response.data.length;
                        var responseIndex = Math.floor((Math.random() * 10) + 1) % totalResponses;
                        var responseFinal = response.data[responseIndex];
                        const user1 = message.mentions.users.first();
                        if (!message.member.roles.cache.find(r => r.name === "BOT")) return message.channel.send('You dont have permission')
                            .then(message => message.delete({ timeout: 5000 })); {
                            if (user1) {
                                const member = message.guild.member(user1);
                                if (member) {
                                    member.ban({ reason: 'You were Banned' }).then(() => {
                                        message.reply(`We Banned The Player ${user1.tag}`, {
                                            files: [responseFinal.images.fixed_height.url]
                                        });
                                    })
                                }
                                else {
                                    message.reply("That user isn\'t in this guild")
                                }
                            }
                            else {
                                message.reply('You need to specify a person!');
                            }
                        }
                    });
                usedCommandRecently.add(message.author.id);
                setTimeout(() => {
                    usedCommandRecently.delete(message.author.id)
                }, 30000); //30s
            }
            break;

        //Roles(Permissions)
        case 'roles':
            if (!message.member.roles.cache.find(r => r.name === "BOT")) return message.channel.send('You dont have permission')
                .then(message => message.delete({ timeout: 5000 }));
            message.reply('Tada')
            break;

        //Cooldown Command
        case 'cooldown':
            if (usedCommandRecently.has(message.author.id)) {
                message.reply('You cannot use that command just yet! Wait another 30 seconds!');
            }
            else {
                message.reply('You are not on cooldown! This is a custom command!');

                //აქ ჩავწერ ფუნქციას რისი გაკეთებაც მინდა

                usedCommandRecently.add(message.author.id);
                setTimeout(() => {
                    usedCommandRecently.delete(message.author.id)
                }, 30000); //30s
            }
            break;

        //Message Reactions
        case 'react':
            message.channel.send('This is going to react to your message!').then(message.react(':am:532978110061084672'));
            break;

        //Random Images Command
        case 'image':
            Image(message);
            break;

        //Poll Command
        case 'poll':
            const Emmbed = new MessageEmbed()
                .setColor(0x0072BB)
                .setTitle('Initiate Poll')
                .setDescription('!poll to initiate a simple yes or no poll');

            if (!args[1]) {
                message.channel.send(Emmbed);
                break;
            }

            let msgArgs = args.slice(1).join(' ');

            message.channel.send('📊 - ' + '**' + msgArgs + '**').then(MessageReaction => {
                MessageReaction.react('👍');
                MessageReaction.react('👎');
                message.delete(5000).catch(console.error);
            });

            break;

        //Spotify Command    
        case 'spotify':
            let user;
            if (message.mentions.users.first()) {
                user = message.mentions.users.first();
            }
            else {
                user = message.author;
            }

            let status = user.presence.activities[0];

            if (user.presence.activities.length === 0 || status.name !== "Spotify" && status.type !== "LISTENING") return message.channel.send('This user is not listening the Spotify');

            if (status !== null && status.type === "LISTENING" && status.name === "Spotify" && status.assets !== null) {
                let SpotifyImage = `https://i.scdn.co/image/${status.assets.largeImage.slice(8)}`,
                    url = `https://open.spotify.com/track/${status.syncID}`,
                    name = status.details,
                    artist = status.state,
                    album = status.assets.largeText,
                    timeStart = status.timestamps.start,
                    timeEnd = status.timestamps.end,
                    timeConvert = Convert(timeEnd - timeStart);

                let minutes = timeConvert.minutes < 10 ? `0${timeConvert.minutes}` : timeConvert.minutes;
                let seconds = timeConvert.seconds < 10 ? `0${timeConvert.seconds}` : timeConvert.seconds;

                let time = `${minutes}:${seconds}`;

                const SpotifyEmbed = new Discord.MessageEmbed()
                    .setAuthor('Spotify Track Information', 'https://pluspng.com/img-png/spotify-logo-png-open-2000.png')
                    .setColor(0x1ED768)
                    .addField('Name:', name, false)
                    .addField('Album:', album, false)
                    .addField('Artist:', artist, true)
                    .addField('Duration:', time, false)
                    .addField('Listen now on Spotify!', `[\`${artist} - ${name}\`](${url})`, false)
                    .setImage(SpotifyImage)
                message.channel.send(SpotifyEmbed)
                console.log(SpotifyImage)
            }
    }
});

//Random Image Command Function
function Image(message) {
    let args = message.content.slice(prefix.length).split(" ");
    var search = args.toString();

    var options = {
        url: "http://results.dogpile.com/serp?qc=images&q=" + search,
        method: "GET",
        headers: {
            "Accept": "text/html",
            "User-Agent": "Chrome"
        }
    };

    request(options, function (error, response, responseBody) {
        if (error) {
            return;
        }


        $ = cheerio.load(responseBody);


        var links = $(".image a.link");

        var urls = new Array(links.length).fill(0).map((v, i) => links.eq(i).attr("href"));

        console.log(urls);

        if (!urls.length) {

            return;
        }

        // Send result
        message.channel.send(urls[Math.floor(Math.random() * urls.length)]);
    });
}

//Bot Login
bot.login(token);