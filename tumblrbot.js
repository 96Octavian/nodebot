var program = require('commander');
const Telegraf = require('telegraf');
var tumblr = require('tumblr.js');
var util = require('util');
var users = { starter: {}}

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

const bot = new Telegraf(BOT_TOKEN)

bot.use(Telegraf.memorySession())

bot.on('text', (ctx) => {
    ctx.session.counter = ctx.session.counter || 0
    ctx.session.counter++
    return ctx.reply(`Message counter: ${ctx.session.counter}`)
})
bot.on('sticker', (ctx) => {
    return ctx.reply(`Message counter: ${ctx.session.counter}`)
})

bot.startPolling()