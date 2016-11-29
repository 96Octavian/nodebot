var program = require('commander');
const Telegraf = require('telegraf');
program
  .version('0.0.1')
  .option('-T, --Token <TOKEN>', 'Specify the bot TOKEN')
  .option('-P, --pineapple', 'Add pineapple')
  .option('-b, --bbq-sauce', 'Add bbq sauce')
  .option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')
  .parse(process.argv);
if (program.Token) {
	BOT_TOKEN = program.Token;
	console.log('Token received')
}
else {
	console.log('You must specify a Token for this bot');
	process.exit(1);
}

const app = new Telegraf(BOT_TOKEN)
app.command('start', (ctx) => ctx.reply('Hey'))
app.on('sticker', (ctx) => ctx.reply('👍'))
app.on('text', (ctx) => {console.log(ctx.message.text); ctx.reply(ctx.message.text);})
app.startPolling()
