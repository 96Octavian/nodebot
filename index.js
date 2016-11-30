var program = require('commander');
const Telegraf = require('telegraf');
var tumblr = require('tumblr.js');
var keys = require('./keys')
var client = keys.client
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

var porter = function (ctx) {
    console.log(ctx.message.text);
    ctx.reply('ricevuto');
    console.log(client.blogInfo('peps96.tumblr.com', function (err, 
data) {}));
};
const bot = new Telegraf(BOT_TOKEN)
bot.command('start', (ctx) => ctx.reply('Hey'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.on('text', (ctx) => { porter(ctx) })
bot.startPolling()
