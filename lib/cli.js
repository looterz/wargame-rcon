var _ = require('underscore'),
    _str = require('underscore.string'),    
    Prompt = require('./prompt'),
    Options = require('./options'),
    Invoker = require('./commands').Invoker,
    Messages = require('./messages'),
    Wargame = require('./wargame'),
    exit = require('exit');

_.mixin(_str.exports());

var RconCli = (function () {
    function RconCli() {
        this.messages = new Messages();
        this.options = new Options();

        this.prompt = new Prompt();
        this.prompt.on('line', this._runCommand.bind(this));
        this.prompt.on('end', exit.bind(null));

        this.wargame = new Wargame();
    }

    RconCli.prototype.run = function (argv, env) {
        // parse arguments
        this.options.init(argv, env);
        
        // if user just wants to run query then we're not in interactive mode
        this.messages.interactiveMode = this.options.args.command === undefined;

        // load config, connect to wargame
        this.config = this.options.getConnectionInfo();

        this.wargame.setup(this.config);
        this.wargame.connection.on('auth', this._onConnect.bind(this));
        this.wargame.connection.on('end', this._onConnectError.bind(this));
        this.wargame.connection.on('response', this._onRecv.bind(this));

        if (this.options.args.connect)
        {
            this.messages.connecting(this.config.server);
            this.wargame.connect();
        }
        else
        {
            this.prompt.next();
        }

        this.invoker = new Invoker(this.messages, this.wargame, this.config);
    };

    RconCli.prototype._onRecv = function (data) {
        this.messages._log(data);
        
        this.prompt.next();
    }

    RconCli.prototype._onConnect = function () {
        this.messages.connected();
        this.messages.welcome(this.options.version);

        this.prompt.next();
    };

    RconCli.prototype._onConnectError = function (err) {
        this.messages.connectionerror(err);
        exit(-1);
    };

    RconCli.prototype._onErrorExit = function (err) {
        this.prompt.exit = true;
        this._onErrorNext(err);
    };

    RconCli.prototype._onErrorNext = function (err) {
        if ( err ) {
            this.messages.error( err );
            this.prompt.next(-1);
        }
    };

    RconCli.prototype._runCommand = function (line, thenExit) {
        this.prompt.exit = thenExit;

        if (!line) {
            this.prompt.next();
            return;
        }

        if (_(line).startsWith("/"))
        {
            this.invoker.run(line)
                .then(this.prompt.next.bind(this.prompt),
                      this._onErrorNext.bind(this));
        }
        else
        {
            if (this.wargame)
            {
                this.invoker.runCommand(line);
            }
        }
    };

    return RconCli;
})();

module.exports = exports = RconCli;