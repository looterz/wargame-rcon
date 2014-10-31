var _ = require('underscore'),
    _str = require('underscore.string'),
    Q = require('q'),
    exit = require('exit');

_.mixin(_str.exports());

/*
function runQuery(messages, writer, query) {
    var start = new Date().getTime();
    return query().then(function(recordset) {
            var elapsed = new Date().getTime() - start;
            if (!recordset) {
                messages.done();
            }
            else {
                writer.write(recordset);
                messages.rowCount(recordset.length, elapsed, writer.appendsLineToResult);
            }
        });
}

var QueryCommand = (function () {
    function QueryCommand(db) {
        this.db = db;
    }

    QueryCommand.prototype.run = function (messages, writer, sql) {
        return runQuery(messages, writer, this.db.query.bind(this.db, sql));
    };
    return QueryCommand;
})();

var ListTablesCommand = (function () {
    function ListTablesCommand(db) {
        this.db = db;
        this.prefix = '.tables';
        this.usage = '.tables';
        this.description = 'Lists all the tables';
    }

    ListTablesCommand.prototype.run = function (messages, writer) {
        return runQuery(messages, writer, this.db.query.bind(this.db, Queries.listTablesSql));
    };
    return ListTablesCommand;
})();

var ListDatabasesCommand = (function () {
    function ListDatabasesCommand(db) {
        this.db = db;
        this.prefix = '.databases';
        this.usage = '.databases';
        this.description = 'Lists all the databases';
    }

    ListDatabasesCommand.prototype.run = function (messages, writer) {
        return runQuery(messages, writer, this.db.query.bind(this.db, Queries.listDatabasesSql));
    };
    return ListDatabasesCommand;
})();

var ReadCommand = (function () {
    function ReadCommand(db) {
        this.db = db;
        this.prefix = '.read';
        this.usage = '.read FILENAME';
        this.description = 'Execute commands in a file';
    }
    
    ReadCommand.prototype.run = function (messages, writer, args) {
        if (!validateArgs(args, 1)) {
            return Q.reject('File name not specified');
        }
        
        var deferred = Q.defer(),
            file = args.join(),
            invoker = new Invoker(messages),
            reader = new LineByLineReader(file),
            last = Q();
            
        reader.on('error', function(err) {
            deferred.reject(err);
        });

        reader.on('line', function (line) {
            last = last.then(function(){
                            messages.echo(line);
                            return invoker.run(line);
                       });
        });

        reader.on('end', function() {
            last.then(function(){
                deferred.resolve();
            }, function(err) {
                deferred.reject(err);
            });
        });        
        
        return deferred.promise;
    };
    
    return ReadCommand;
})();

var GetSchemaCommand = (function () {
    function GetSchemaCommand(db) {
        this.db = db;
        this.prefix = '.schema';
        this.usage = '.schema TABLE';
        this.description = 'Shows the schema of a table';
    }

    GetSchemaCommand.prototype.run = function (messages, writer, args) {
        if (!validateArgs(args, 1)) {
            return Q.reject('Table name not specified');
        }

        return runQuery(messages, writer, this.db.query.bind(this.db, Queries.getSchemaSql, [args[0]]));
    };
    return GetSchemaCommand;
})();

var ListIndexesCommand = (function () {
    function ListIndexesCommand(db) {
        this.db = db;
        this.prefix = '.indexes';
        this.usage = '.indexes TABLE';
        this.description = 'Lists all the indexes of a table';
    }

    ListIndexesCommand.prototype.run = function (messages, writer, args) {
        if (!validateArgs(args, 1)) {
            return Q.reject('Table name not specified');
        }
        
        return runQuery(messages, writer, this.db.query.bind(this.db, Queries.listIndexesSql, [args[0]]));
    };
    return ListIndexesCommand;
})();

var AnalyzeCommand = (function () {
    function AnalyzeCommand(db) {
        this.db = db;
        this.prefix = '.analyze';
        this.usage = '.analyze';
        this.description = 'Analyzes the database for missing indexes.';
    }

    AnalyzeCommand.prototype.run = function (messages, writer, args) {        
        return runQuery(messages, writer, this.db.query.bind(this.db, Queries.listMissingIndexesSql));
    };
    return AnalyzeCommand;
})();
*/
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
        return this.commandRunner.run(this.messages, this.wargame, line);
    };

    return Invoker;
})();

exports.Invoker = Invoker;