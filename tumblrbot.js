var program = require('commander');
const Telegraf = require('telegraf');
var tumblr = require('tumblr.js');
var fs = require('fs');
var logger = require('./logger');
const Markup = require('telegraf/lib/helpers/markup')
const Extra = require('telegraf/lib/helpers/extra')

authenticating = JSON.parse(fs.readFileSync('./auth.json'));
/*
Solo post di testo presenti
*/

program
  .version('0.0.1')
  .option('-T, --Token <TOKEN>', 'Specify the bot TOKEN')
  .parse(process.argv);
if (program.Token) {
    BOT_TOKEN = program.Token;
    logger.info('Token received')
}
else {
    logger.error('You must specify a Token for this bot');
    process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN)

bot.use(Telegraf.memorySession())

//bot.on('message', ctx => console.log('Message'));

var consumer_key = function (ctx) {
  logger.debug('consumer_key from', ctx.chat.id)
  logger.info('Received consumer_key');
  ctx.session.clients.consumer_key = ctx.message.text.replace('/consumer_key ', '');
  return ctx.reply(ctx.session.clients);
}
var consumer_secret = function (ctx) {
  logger.debug('consumer_secret from', ctx.chat.id)
  logger.info('Received consumer_secret');
  ctx.session.clients.consumer_secret = ctx.message.text.replace('/consumer_secret ', '');
  return ctx.reply(ctx.session.clients);
}
var token_secret = function (ctx) {
  logger.debug('token_secret from', ctx.chat.id)
  logger.info('Received token_secret');
  ctx.session.clients.token_secret = ctx.message.text.replace('/token_secret ', '');
  return ctx.reply(ctx.session.clients);
}
var token = function (ctx) {
  logger.debug('token from', ctx.chat.id)
  logger.info('Received token');
  ctx.session.clients.token = ctx.message.text.replace('/token ', '');
  return ctx.reply(ctx.session.clients);
}
bot.command('login', ctx => {
  logger.debug('\'/login\' from', ctx.chat.id)
  arr = authenticating[ctx.chat.id];
  ctx.session.client = tumblr.createClient(arr);
  identity(ctx);
})
bot.command('allset', ctx => {
  logger.debug('\'/allset\' from', ctx.chat.id)
  var fixedJSON = ctx.message.text.replace('/allset ', '').replace(/(\r\n|\n|\r)/gm,"").replace(/'/g, "\"");
  arr = JSON.parse(fixedJSON.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": '));
  ctx.session.client = tumblr.createClient(arr);
  identity(ctx);
  authenticating[ctx.chat.id] = arr;
  fs.writeFile('./auth.json', JSON.stringify(authenticating), function (err) {
      if (err) logger.error(err);;
      logger.warn('New client ID set');;
  })
  return ctx.reply('All set');
})
var set = function (ctx) {
  logger.debug('\'/set\' from', ctx.chat.id)
  if (Object.keys(ctx.session.clients).length === 4) {
    ctx.session.client = tumblr.createClient(ctx.session.clients);
    identity(ctx);
    authenticating[ctx.chat.id] = ctx.session.clients;
    fs.writeFile('./auth.json', JSON.stringify(authenticating), function (err) {
      if (err) logger.error(err);
      logger.warn('New client ID set');
    })
    return ctx.reply('All set');
  }
  else {
    logger.error('Client credentials not completely specified');
    ctx.reply('Credentials incomplete');
  }
}
bot.command(['consumer_secret', 'consumer_key', 'token', 'token_secret', 'set'], ctx => {
  ctx.session.clients = ctx.session.clients || {}
  var text = ctx.message.text;
  if (text === '/set') {
    set(ctx);
  }
  else if (text.substring(0, 14) == '/consumer_key ') {
    consumer_key(ctx);
  }
  else if (text.substring(0, 17) === '/consumer_secret ') {
    consumer_secret(ctx);
  }
  else if (text.substring(0,7) === '/token ') {
    token(ctx);
  }
  else if (text.substring(0,14) === '/token_secret ') {
    token_secret(ctx)
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
bot.command('me', ctx => {
  logger.debug('\'/me\' from', ctx.chat.id);
  if (typeof ctx.session.client !== 'undefined') {
    identity(ctx);
  }
  else {
    ctx.reply('You are not logged in');
    logger.warn('User', ctx.chat.id, 'not logged in');
  }
})

var blog = function (ctx) {
  if (typeof ctx.session.names !== 'undefined' && ctx.session.names.length !== 0) {
    buttons = []
    for (e in ctx.session.names) {
      buttons.push([Markup.callbackButton(ctx.session.names[e], ctx.session.names[e])])
    }
    return ctx.reply('Choose your blog', Extra.HTML().markup(
      Markup.inlineKeyboard(buttons)))
  }
  else {
    logger.warn('User', ctx.chat.id, 'not logged in');
    ctx.reply('You are not logged in');
  }
}
bot.command('blog', ctx => {logger.debug('\'/blog\' from', ctx.chat.id); blog(ctx)})

bot.action(/.+/, (ctx) => {
  ctx.session.name = ctx.match[0]
  ctx.answerCallbackQuery(ctx.match[0] + ' set as destination')
  ctx.editMessageText(ctx.match[0] + ' set as destination')
  logger.info(ctx.match[0], 'set as destination for', ctx.chat.id)  
})

var texter = function (ctx) {
  ctx.session.post['type'] = 'text';
  ctx.session.post['body'] = ctx.message.text.replace('/text ', '');
  ctx.reply('Post body set');
  logger.info('Post body set');
}
var titler = function (ctx) {
  ctx.session.post['title'] = ctx.message.text.replace('/title ', '');
  ctx.reply('Post title set');
  logger.info('Post tile set');
}
var poster = function (ctx) {
  if (ctx.session.post.type && ctx.session.post.body) {
    ctx.session.client.createPost(ctx.session.name, ctx.session.post, function (err, data) {
      if (err) {
        logger.err(err);
        ctx.reply('Error: no post created')
      }
      else {
        logger.info('New post created')
        ctx.reply('Post!\nLink: http://' + ctx.session.name + '.tumblr.com/post/' + data.id);
        ctx.session.post = {}
      }
    });
  }
  else {
    logger.debug('Post action requested but no post set')
    ctx.reply('No post body set');
  }
}
var tagger = function (ctx) {
  ctx.session.post['tags'] = ctx.message.text.replace('/tags ', '');
  ctx.reply('Tags set');
  logger.info('Tags set');
}
var stater = function (ctx) {
  if (ctx.message.text.replace('/state ', '') in ['published', 'draft', 'queue', 'private']) {
    ctx.session.post['state'] = ctx.message.text.replace('/state ', '');
    ctx.reply('State set');
    logger.info('State set');
  }
  else {
    ctx.reply('State must be one of published, draft, queue, private');
    logger.info('Unrecognize state');
  }
}
var porter = function (ctx) {
  if (typeof ctx.session.client === 'undefined') {
     logger.warn('User', ctx.chat.id, 'has not yet logged in');
     ctx.reply('You have to /login first or set your credentials')
  }
  else if (typeof ctx.session.name === 'undefined') {
    logger.warn('User', ctx.chat.id, 'has not yet selected a main blog');
    ctx.reply('You have to select your destination using the /blog command')
  }
  else {
    ctx.session.post = ctx.session.post || {}
    var text = ctx.message.text;
    if (text === '/post') {
      poster(ctx);
    }
    else if (text.substring(0, 6) === '/text ') {
      texter(ctx);
    }
    else if (text.substring(0, 7) === '/title ') {
      titler(ctx);
    }
    else if (text === '/id') {
      ctx.reply(ctx.chat.id);
    }
    else if (text.substring(0,6) === '/tags ') {
      tagger(ctx);
    }
    else if (text.substring(0,7) === '/state ') {
      stater(ctx);
    }
  }
};
bot.command(['id', 'title', 'text', 'post'], (ctx) => { logger.debug('\'', ctx.message.text, '\' from', ctx.chat.id); porter(ctx) })

bot.command('start', ctx => {
  logger.debug('\'/start\' from', ctx.chat.id); 
  ctx.session.names = ctx.session.names || []
  ctx.reply('Hey');
})

bot.startPolling()
