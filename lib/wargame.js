var _ = require('underscore'),
    _str = require('underscore.string'),
    rcon = require('./rcon'),
    exit = require('exit');

_.mixin(_str.exports());

var Wargame = (function () {
    var Wargame = function(config) {
        this.connection = null;
    };

    Wargame.prototype.setup = function (config) {
        this.connection = new rcon(config.server, config.port, config.password);
    }

    Wargame.prototype.connect = function () {
        if (this.connection)
        {
            this.connection.connect();
        }
    };

    return Wargame;
})();

module.exports = exports = Wargame;