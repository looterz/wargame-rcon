var pjson = require('../package.json'),
    path = require('path'),
    fs = require('fs'),
    _ = require('underscore');

var DEFAULT_CONFIG = './config.json';

var Options = (function() {
    function Options() {
        this.version = pjson.version;
    }

    Options.prototype.init = function (argv, env) {
        var program = require('commander');

        program.version( this.version )
                .option( '-s, --server <server>', 'Server to conect to' )
                .option( '-o, --port <port>', 'Port to connect to' )
                .option( '-p, --pass <pass>', 'Password to use for authentication' )
                .option( '-c, --connect', 'Whether or not to connect upon launching the tool')
                .option( '-sv, --save [path]', 'Save connection information to config file, default ./config.json')
                .option( '-cc, --config <path>', 'Read connection information from config file')
                .option( '-d, --dir', 'Print working directory location of wargame-rcon tool');
        program.parse( argv );

        this.env = env;
        this.args = {};
        _.extend(this.args, _.pick(program, 'server', 'port', 'pass', 'save', 'config', 'dir'));

        if (this.args.config && !fs.existsSync(this.args.config)) {
            throw new Error(_.sprintf('config file \'%s\' does not exist.', this.args.config));
        }
    };

    Options.prototype.getConnectionInfo = function() {
        var args = this.args || {},
            env = this.env || {},
            configPath = args.config || DEFAULT_CONFIG;

        var config = {};

        if (fs.existsSync(configPath)) 
        {
            config = require(path.resolve(configPath));
        }

        var defaults = {
            server: env.RCONCLI_SERVER || 'localhost',
            port: env.RCONCLI_PORT || 1337,
            pass: env.RCONCLI_PASSWORD || ''
        };

        config = _.extend({}, defaults, config, args);

        var connectInfo = {
            server: config.server,
            port: config.port,
            password: config.pass,
        };

        if (args.save)
        {
            fs.writeFile(configPath, JSON.stringify(config, null, 4), function(err) {
                if (err) 
                {
                    console.log(err);
                } 
                else 
                {
                    console.log(_.sprintf('config file saved to \'%s\'.', args.config));
                }
            });
        }

        if (args.dir)
        {
            console.log(_.sprintf('wargame-rcon working directory \'%s\'.', process.cwd()));
        }

        return connectInfo;
    };

    return Options;
})();

module.exports = exports = Options;