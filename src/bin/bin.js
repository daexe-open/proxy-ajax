import {
    parse,
    get
} from "opts";
import {
    resolve
} from "path";
// import url from "url";
import pjson from "pjson";
import httpProxy from 'http-proxy';
import fs from 'fs';
import httpsProxy from './httpsProxy'
import proxy from './proxy'
import { request, connect, handleRequest } from "./util"
import colors from 'colors'
let version = pjson.version;

parse([{
    short: "v",
    long: "version",
    description: "Show the version",
    required: false,
    callback: function () {
        console.log(version);
        return process.exit(1);
    }
}, {
    short: "p",
    long: "port",
    description: "Specify the port",
    value: true,
    required: false
}].reverse(), true);

let port = get('port');

let configFilePath = resolve(process.argv[2] || "./.proxy-ajax.config.js");
if (process.argv[2] == "-p") {
    configFilePath = resolve("./.proxy-ajax.config.js");
}
proxy(configFilePath, port);