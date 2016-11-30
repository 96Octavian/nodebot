var program = require('commander');
const Telegraf = require('telegraf');
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
    console.log(ctx);
    ctx.reply('ricevuto');
    ctx.telegram.sendMessage(ctx.message.chat.id, `Hello ${ctx.state.role}`);
}

const bot = new Telegraf(BOT_TOKEN)
bot.command('start', (ctx) => ctx.reply('Hey'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.on('text', (ctx) => { porter(ctx) })
bot.startPolling()