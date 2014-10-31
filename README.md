## wargame-rcon

Command line interface for Wargame's Server Rcon protocol.

## Installation

You can install the wargame-rcon npm package.
```bash
npm i -g wargame-rcon
```

If you're more adventurous and like to live on the edge then you can install development version as follows:
```bash
git clone https://github.com/looterz/wargame-rcon
cd wargame-rcon
npm i -g
```

## Getting Started

To get the list of all parameters type 'wargame-rcon -h'
```bash
  Usage: wargame-rcon [options]

  Options:

    -h, --help             output usage information
    -V, --version          output the version number
    -s, --server <server>  Server to conect to
    -o, --port <port>      Port to connect to
    -p, --pass <pass>      Password to use for authentication
    -c, --connect          Whether or not to connect upon launching the tool
    -sv, --save [path]     Save connection information to config file, default ./config.json
    -cc, --config <path>   Read connection information from config file
    -d, --dir              Print working directory location of wargame-rcon tool
```

To connect to a running wargame dedicated server and begin issuing commands, run the following:
```bash
wargame-rcon --server my-server.net --port 1337 --pass rconpass --save
```

After launching the tool, you will enter command-line mode. You can begin issuing commands to the tool, and the first command you will most likely want to issue is /connect.