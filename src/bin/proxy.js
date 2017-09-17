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
import { request, connect } from "./util"
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
let server;
// 管理连接
let sockets = [];
// 新建一个代理 Proxy Server 对象
var proxy = httpProxy.createProxyServer({});
proxy.on('proxyReq', function (proxyReq, req, res, options) {
    proxyReq.setHeader('X-Special-Proxy-Header', 'tap');
    proxyReq.setHeader('X-WH-REQUEST-URI', req._originUrl);
});
proxy.on('proxyRes', function (proxyRes, req, res) {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'PUT,POST,GET,DELETE,OPTIONS';
});
// 捕获异常  
proxy.on('error', function (err, req, res) {
    res.writeHead(500, {
        'Content-Type': 'text/plain'
    });
    res.end('Something went wrong. And we are reporting a custom error message.');
});
//根据路径获取数据
function getData(configFilePath) {
    return new Promise(function (resolve, reject) {
        //如果是数据文件内容，直接返回
        if (configFilePath.match("{")) {
            resolve(JSON.parse(configFilePath));
        }
        else if (configFilePath.match(".js")) {
            //如果是数据文件，需要加载
            console.log("import config file from " + configFilePath)
            delete require.cache[require.resolve(configFilePath)];
            resolve(require(configFilePath));

        } else {
            //不能require，需要使用文件读取
            console.log("read config file from " + configFilePath)
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
        }
    });
}
//根据配置初始化代理
getData(configFilePath).then(function (value) {

    let proxyConfig = (typeof value == "object") ? value : JSON.parse(value);
    proxyConfig = proxyConfig.proxyConfig || proxyConfig;
    let _proxy = proxyConfig.proxy.reverse();
    server = require('http').createServer(function (req, res) {

        // 在这里可以自定义你的路由分发
        var host = req.headers.host,
            rurl = req.url,
            ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        console.log("");
        console.log('client ip: '.blue + ip + ' , host: '.green + host);
        console.log("request URL: ".cyan + rurl);

        let p = _proxy.find(function (p) {
            var rule = new RegExp(p.path);
            return rule.exec(rurl) && p.path;
        });
        if (p) {

            console.log("find rule for above url!".yellow)
            if (p.data) {
                let _data = "";
                if (typeof p.data == 'object') {
                    //如果 data值为 {xx:yy} 这种
                    _data = JSON.stringify(p.data);
                } else if (typeof p.data == 'string' && p.data.match("{")) {
                    //如果 data值为 ‘{xx:yy}’ 这种
                    _data = p.data;
                } else {
                    //如果 data值为 “./data/.data.js” 这种
                    _data = resolve(p.data)
                }
                getData(_data).then(function (value) {

                    let callbackName = new RegExp("callback=(.*)&", "g").exec(req.url);
                    if (callbackName && callbackName[1]) {
                        console.log("jsonp match given data! ".red);
                        res.writeHead(200, {
                            'Content-Type': 'application/json'
                        });
                        res.end(callbackName[1] + "(" + JSON.stringify(value) + ")");
                    } else {
                        console.log("ajax match given data! ".red);
                        res.writeHead(200, {
                            'Content-Type': 'application/json'
                        });
                        res.end(JSON.stringify(value));

                    }
                })

            } else if (p.routeTo) {
                if (p.routeTo.match("//")) {
                    let targetUrl = p.routeTo;
                    let callbackName = new RegExp("callback=(.*)&", "g").exec(req.url);
                    if (callbackName && callbackName[1]) {
                        console.log("jsonp match given data! ".red);
                        targetUrl += "?callback=" + callbackName[1];
                    }
                    console.log("proxy to: ".red + targetUrl);
                    // 设置req
                    request(req, res, targetUrl)
                } else {
                    console.log("proxy to: ".red + proxyConfig[p.routeTo]);
                    // 设置req
                    req._originUrl = req.url;
                    proxy.web(req, res, {
                        target: proxyConfig[p.routeTo]
                    });
                }
            } else {
                request(req, res)
            }
        } else {
            request(req, res)
        }

    });
    server.listen((port || proxyConfig.port));
    server.on("connection", function (socket) {
        sockets.push(socket);
        socket.once("close", function () {
            sockets.splice(sockets.indexOf(socket), 1);
        });
    });
    server.on('connect', function (cReq, cSock) {
        console.log("");
        console.log("connect ".yellow + cReq.url);
        connect(cReq, cSock);
    });
    if (proxyConfig.httpsPort) {
        httpsProxy(proxyConfig);
    }
    console.log("proxy ajax server start succesfully on port " + (port || proxyConfig.port) + " !");

},
    function (error) {
        console.log(error)
    });

//关闭之前，我们需要手动清理连接池中得socket对象
function closeServer() {
    sockets.forEach(function (socket) {
        socket.destroy();
    });
    server.close(function () {
        console.log("close server, done!");
        process.exit(1);
    });
}
process.on('exit', function () {
    console.log("welcome back, have a nice day!");
});
process.on('SIGINT', function () {
    closeServer();
    process.exit(1);
});