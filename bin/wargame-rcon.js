var RconCli = require('../lib/cli');

var argv = process.argv.splice(0);
var cli = new RconCli();
cli.run(argv, process.env);