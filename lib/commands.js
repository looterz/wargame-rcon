var _ = require('underscore'),
    _str = require('underscore.string'),
    Q = require('q'),
    exit = require('exit');

_.mixin(_str.exports());

var QuitCommand = (function () {
    function QuitCommand() {
        this.prefix = '/quit';
        this.usage = '/quit';
        this.description = 'Exit the cli';
    }

    QuitCommand.prototype.run = function (messages, wargame, config) {
        exit(0);
        return Q();
    };
    return QuitCommand;
})();

var HelpCommand = (function () {
    function HelpCommand() {
        this.prefix = '/help';
        this.usage = '/help';
        this.description = 'Shows this message';
    }

    HelpCommand.prototype.run = function (messages, wargame, config) {
        var commands = createAll(null, null);
        var doc = commands.map(function(cmd){
            return {
                command: cmd.usage,
                description: cmd.description
            };
        });
        console.log(doc);

        return Q(); // resolved promise
    };
    return HelpCommand;
})();

var RunCommand = (function () {
    function RunCommand() {
        this.prefix = '/exec';
        this.usage = '/exec';
        this.description = 'Executes a command on the remote server console';
    }

    RunCommand.prototype.run = function (messages, wargame, cmd) {
        if (wargame.connection)
        {
            wargame.connection.send(cmd);
        }

        return Q(); // resolved promise
    };
    
    return RunCommand;
})();

var ConnectCommand = (function () {
    function ConnectCommand() {
        this.prefix = '/connect';
        this.usage = '/connect';
        this.description = 'Connects to the remote server';
    }

    ConnectCommand.prototype.run = function (messages, wargame, config) {
        messages.connecting(config.server);
        wargame.connect();

        return Q(); // resolved promise
    };
    
    return ConnectCommand;
})();

function createAll(db) {
    var commands = [
            new HelpCommand(),
            new ConnectCommand(),
            new QuitCommand()
        ];

    return commands;
}

function validateArgs(args, minCount) {
    return args && Array.isArray(args) && args.length >= minCount;
}

var Invoker = (function () {
    function Invoker(messages, wargame, config) {
        this.messages = messages;
        this.wargame = wargame;
        this.config = config;
        this.commands = createAll();

        this.default = new HelpCommand();
        this.commandRunner = new RunCommand();
    }

    Invoker.prototype.run = function (line) {
        var tokens = line.split(' ');

        var cmd = _.findWhere(this.commands, {prefix: tokens[0]});
        if (cmd) {
            return cmd.run(this.messages, this.wargame, this.config, tokens.splice(1));
        }
        return this.default.run(this.messages, this.wargame, this.config, line);
    };

    Invoker.prototype.runCommand = function (line) {
        return this.commandRunner.run(this.messages, this.wargame, this.config, line);
    };

    return Invoker;
})();

exports.Invoker = Invoker;