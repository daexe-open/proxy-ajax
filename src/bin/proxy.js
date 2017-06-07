import {
    parse,
    get
} from "opts";
import {
    resolve
} from "path";
import pjson from "pjson";
import httpProxy from 'http-proxy';
import fs from 'fs';

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

let port = get('port') || 80;
let configFilePath = resolve(process.argv[2] || "./.proxy-ajax.config");

// 新建一个代理 Proxy Server 对象
var proxy = httpProxy.createProxyServer({});
// 捕获异常  
proxy.on('error', function (err, req, res) {
    res.writeHead(500, {
        'Content-Type': 'text/plain'
    });
    res.end('Something went wrong. And we are reporting a custom error message.');
});

var promise = new Promise(function (resolve, reject) {
    fs.stat(configFilePath, function (err, stats) {
        if (err) {
            console.log(".proxy-ajax.config file not found in dir ./");
            reject("error");
            return;
        }
        if (stats.isFile()) {
            fs.readFile(configFilePath, function (err, data) {
                if (err) {
                    console.log(".proxy-ajax.config read error");
                    reject("error");
                    return;
                }
                resolve(data);
            })
        }
    });
});
promise.then(function (value) {
        let proxyConfig = JSON.parse(value);
        var server = require('http').createServer(function (req, res) {
            // 在这里可以自定义你的路由分发
            var host = req.headers.host,
                ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            console.log("client ip: " + ip + ", host: " + host);
            console.log("request URL：" + req.url);

            proxyConfig.proxy && proxyConfig.proxy.forEach((p) => {

                if (p.host.find((h) => {
                        return h == host;
                    })) {
                    let frule = p.rule.find((r) => {
                        return (req.url.indexOf(r.path) != -1)
                    });
                    if (frule) {
                        console.log("proxy to ：" + proxyConfig[frule.routeTo]);
                        proxy.web(req, res, {
                            target: proxyConfig[frule.routeTo]
                        });
                    } else {
                        console.log("proxy to ：" + proxyConfig[frule.otherRouteTo]);
                        proxy.web(req, res, {
                            target: proxyConfig[p.otherRouteTo]
                        });
                    }
                } else {
                    res.writeHead(200, {
                        'Content-Type': 'text/plain',
                        'Access-Control-Allow-Origin': "*"
                    });
                    res.end('Welcome to proxy ajax server!');
                }
            })

        });

        console.log("proxy ajax server start succesfully!");
        server.listen(port || proxyConfig.port);
    },
    function (error) {});