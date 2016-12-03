var program = require('commander');
const Telegraf = require('telegraf');
var tumblr = require('tumblr.js');
var fs = require('fs');
authenticating = JSON.parse(fs.readFileSync('./auth.json'));
/*Da aggiungere una funzione /blog che con una callback_query cambi il
blog su cui postare
Da definire le varie funzioni per creare i post
Controllo errori mancante*/

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

bot.command('consumer_key', ctx => {
    ctx.session.clients.consumer_key = ctx.message.text.replace('/consumer_key ', '');
    return ctx.reply(ctx.session.clients);
})
bot.command('consumer_secret', ctx => {
    ctx.session.clients.consumer_secret = ctx.message.text.replace('/consumer_secret ', '');
    return ctx.reply(ctx.session.clients);
})
bot.command('token_secret', ctx => {
    ctx.session.clients.token_secret = ctx.message.text.replace('/token_secret ', '');
    return ctx.reply(ctx.session.clients);
})
bot.command('token', ctx => {
    ctx.session.clients.token = ctx.message.text.replace('/token ', '');
    return ctx.reply(ctx.session.clients);
})
bot.command('allset', ctx => {
    arr = JSON.parse(ctx.message.text.replace('/allset ', ''));
    ctx.session.client = tumblr.createClient(arr);
    /*ctx.session.client.userInfo(function (err, data) {
      msg = 'Username: ' + data.user.name + '\nAvailable blogs: ';
      name = data.user.blogs[0].name;
      var i;
      for ( i in data.user.blogs ) {
        msg += '\n' + data.user.blogs[i].name
        ctx.session.names.push(data.user.blogs[i].name)
      }
      ctx.reply(msg);
    });*/
    identity(ctx);
    authenticating[ctx.chat.id] = arr;
    fs.writeFile('./auth.json', JSON.stringify(authenticating), function (err) {
        if (err) console.log(err);
        console.log('Done');
    })
    return ctx.reply('All set');
})
bot.command('set', ctx => {
    if (Object.keys(ctx.session.clients).length === 4) {
        ctx.session.client = tumblr.createClient(ctx.session.clients);
        /*ctx.session.client.userInfo(function (err, data) {
          msg = 'Username: ' + data.user.name + '\nAvailable blogs: ';
          name = data.user.blogs[0].name;
          var i;
          for ( i in data.user.blogs ) {
            msg += i.name
            ctx.session.names.push(i.name)
          }
          ctx.reply(msg);
        });*/
        identity(ctx);
        authenticating[ctx.chat.id] = arr;
        fs.writeFile('./auth.json', JSON.stringify(authenticating), function (err) {
            if (err) console.log(err);
            console.log('Done');
        })
        return ctx.reply('All set');
    }
})
var identity = function (ctx) {
    ctx.session.client.userInfo(function (err, data) {
        msg = 'Username: ' + data.user.name + '\nAvailable blogs: ';
        name = data.user.blogs[0].name;
        var i;
        for (i in data.user.blogs) {
            msg += '\n' + data.user.blogs[i].name
            ctx.session.names.push(data.user.blogs[i].name)
        }
        return ctx.reply(msg);
    })
}
bot.command('me', ctx => identity(ctx))

bot.command('start', ctx => {
    ctx.session.clients = ctx.session.clients || {}
    ctx.session.names = ctx.session.names || []
    ctx.reply('Hey');
})
bot.on('text', (ctx) => {
    ctx.session.counter = ctx.session.counter || 0
    ctx.session.counter++
    return ctx.reply(`Message counter: ${ctx.session.counter}`)
})
bot.on('sticker', (ctx) => {
    return ctx.reply(`Message counter: ${ctx.session.counter}`)
})

bot.startPolling()
