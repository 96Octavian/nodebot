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
        client.createPost('aula-magna', post, function(err, data) {datis = data; erro = err});
    }
    else {
        ctx.reply('Nessun post in coda');
    }
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
    console.log(ctx.message.text);
    if (ctx.message.text === '/post') {
        poster(ctx);
    }
    else if (ctx.message.text.substring(0, 6) === '/text ') {
        texter(ctx);
    }
    else if (ctx.message.text.substring(0, 7) === '/title ') {
        titler(ctx);
    }
};
const bot = new Telegraf(BOT_TOKEN)
bot.command('start', (ctx) => ctx.reply('Hey'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.on('text', (ctx) => { porter(ctx) })
bot.startPolling()