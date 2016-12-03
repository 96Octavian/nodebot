var program = require('commander');
const Telegraf = require('telegraf');
var tumblr = require('tumblr.js');
var fs = require('fs');
const Markup = require('telegraf/lib/helpers/markup')
const Extra = require('telegraf/lib/helpers/extra')

authenticating = JSON.parse(fs.readFileSync('./auth.json'));
/*
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

//bot.on('message', ctx => console.log('Message'));

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
bot.command('login', ctx => {
  arr = JSON.parse(authenticating[ctx.chat.id]);
  ctx.session.client = tumblr.createClient(arr);
  identity(ctx);
})
bot.command('allset', ctx => {
    arr = JSON.parse(ctx.message.text.replace('/allset ', ''));
    ctx.session.client = tumblr.createClient(arr);
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
  ctx.session.names = []
  ctx.session.client.userInfo(function (err, data) {
    msg = 'Username: ' + data.user.name + '\nAvailable blogs: ';
    ctx.session.name = ctx.session.name || data.user.blogs[0].name;
    var i;
    for (i in data.user.blogs) {
      msg += '\n' + data.user.blogs[i].name
      ctx.session.names.push(data.user.blogs[i].name)
    }
    return ctx.reply(msg);
  })
}
bot.command('me', ctx => identity(ctx))

var blog = function (ctx) {
  buttons = []
  for (e in ctx.session.names) {
    buttons.push([Markup.callbackButton(ctx.session.names[e], ctx.session.names[e])])
  }
  return ctx.reply('Choose your blog', Extra.HTML().markup(
    Markup.inlineKeyboard(buttons)
    ))
}
bot.command('blog', ctx => blog(ctx))

bot.action(/.+/, (ctx) => {
  ctx.answerCallbackQuery(`Oh, ${ctx.match[0]}! Great choise`)
  ctx.session.name = ctx.match[0]
})

var texter = function (ctx) {
  ctx.session.post['type'] = 'text';
  ctx.session.post['body'] = ctx.message.text.replace('/text ', '');
  ctx.reply('Post body set');
}
var titler = function (ctx) {
  ctx.session.post['title'] = ctx.message.text.replace('/title ', '');
  ctx.reply('Post title set');
}
var poster = function (ctx) {
  if (ctx.session.post.type && ctx.session.post.body) {
      ctx.session.client.createPost(ctx.session.name, ctx.session.post, function (err, data) {
          ctx.reply('Post!\nLink: http://' + ctx.session.name + '.tumblr.com/post/' + data.id);
      });
  }
  else {
      ctx.reply('Nessun post in coda');
  }
  ctx.session.post = {}
}
var porter = function (ctx) {
  ctx.session.post = ctx.session.post || {}
  var text = ctx.message.text;
  console.log('From id: ' + ctx.message.from.id);
  console.log('Chat id: ' + ctx.message.chat.id)
  console.log('Text: ' + text);
  if (text === '/post') {
      poster(ctx);
  }
  else if (text.substring(0, 6) === '/text ') {
      texter(ctx);
  }
  else if (text.substring(0, 7) === '/title ') {
      titler(ctx);
  }
  else if (text.substring(0, 3) === '/id') {
      ctx.reply(ctx.chat.id);
  }
};
bot.command(['id', 'title', 'text', 'post'], (ctx) => { porter(ctx) })

bot.command('start', ctx => {
    ctx.session.clients = ctx.session.clients || {}
    ctx.session.names = ctx.session.names || []
    ctx.reply('Hey');
})

bot.startPolling()