var program = require('commander');
program
  .version('0.0.1')
  .option('-T, --Token <TOKEN>', 'Specify the bot TOKEN')
  .option('-P, --pineapple', 'Add pineapple')
  .option('-b, --bbq-sauce', 'Add bbq sauce')
  .option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')
  .parse(process.argv);
if (program.Token) console.log(program.Token)
