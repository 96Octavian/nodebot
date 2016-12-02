var program = require('commander');
const Telegraf = require('telegraf');
var tumblr = require('tumblr.js');
var keys = require('./keys')
var client = keys.client
var post = {}

program
  .version('0.0.1')
  .option('-T, --Token <TOKEN>', 'Specify the bot TOKEN')
  .parse(process.argv);
if (program.Token) {
	BOT_TOKEN = program.Token;
	console.log('Token received')
}
else {
	console.log('You must specify a Token for this bot');
	process.exit(1);
}

var poster = function (ctx) {
    if (post.text && post.body) {
        client.createPost('aula-magna', post, function (err, data) {
            ctx.reply('Post!\nLink: http://aula-magna.tumblr.com/post/' + data.id);
        });
    }
    else {
        ctx.reply('Nessun post in coda');
    }
    post = {}
}

var texter = function (ctx) {
    post['text'] = 'text';
    post['body'] = ctx.message.text.replace('/text ', '');
    ctx.reply('Post body set');
}

var titler = function (ctx) {
    post['title'] = ctx.message.text.replace('/title ', '');
    ctx.reply('Post title set');
}

var porter = function (ctx) {
    var text = ctx.message.text;
    console.log('From id: ' + ctx.message.from.id);
    console.log('Chat id: ' + ctx.message.chat.id)
    console.log('Text: ' + text);
    if ( ctx.from.id === 66441008 ) {
        if (text === '/post') {
            poster(ctx);
        }
        else if (text.substring(0, 6) === '/text ') {
            texter(ctx);
        }
        else if (text.substring(0, 7) === '/title ') {
            titler(ctx);
        }
    }
    else {
        ctx.reply('Fatti un po\' di affari tuoi');
    }
    if (text.substring(0, 3) === '/id') {
        ctx.reply(ctx.from.id);
    }
};
const bot = new Telegraf(BOT_TOKEN)
bot.command('start', (ctx) => ctx.reply('Hey'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.on('text', (ctx) => { porter(ctx) })
bot.startPolling()