var readline = require('readline'),
    util = require('util'),
    events = require('events'),
    colors = require('colors');

var Prompt = (function() {
    function Prompt() {
        events.EventEmitter.call(this);

        // initialize prompt
        var promptText = 'wargame-rcon> ';

        this.rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        this.rl.setPrompt(promptText.underline.yellow, promptText.length);
        this.rl.on('line', this.emit.bind(this, 'line'));
    }

    util.inherits(Prompt, events.EventEmitter);

    Prompt.prototype.next = function (code) {
        if (this.exit) {
            code = code === undefined ? 0: code;
            this.emit('end', code);
        }
        else {
            setImmediate(this.rl.prompt.bind(this.rl));
        }
    };

    return Prompt;
})();

module.exports = exports = Prompt;