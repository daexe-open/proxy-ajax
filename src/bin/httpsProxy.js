const https = require('https')
const fs = require('fs')
const path = require('path')
const httpProxy = require('http-proxy')
import { request, connect } from "./util"
import {
    resolve, join
} from "path";
const PORT = 443

let proxyServer = httpProxy.createProxyServer()
proxyServer.on('proxyReq', function (proxyReq, req, res, options) {
    proxyReq.setHeader('X-Special-Proxy-Header', 'tap');
    proxyReq.setHeader('X-WH-REQUEST-URI', req._originUrl || "");
});

proxyServer.on('proxyRes', function (proxyRes, req, res) {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'PUT,POST,GET,DELETE,OPTIONS';
});

proxyServer.on('proxyReq', (proxyReq, req) => {
    req._proxyReq = proxyReq;
})

proxyServer.on('error', (err, req, res) => {
    if (req.socket.destroyed && err.code === 'ECONNRESET') {
        req._proxyReq.abort();
    }
})

export default function (proxyConfig) {
    const SECURE_OPTIONS = {
        // ca: [
        //     fs.readFileSync(resolve(join(__dirname,'../localhost-cert/server.csr')))
        // ],
        cert: fs.readFileSync(resolve(proxyConfig.cert || join(__dirname, '../localhost-cert/server.crt')), 'utf-8'),
        key: fs.readFileSync(resolve(proxyConfig.key || join(__dirname, '../localhost-cert/server.key')), 'utf-8'),
        requestCert: false,
        rejectUnauthorized: false
    }
    https.createServer(SECURE_OPTIONS, function (req, res) {

        // 在这里可以自定义你的路由分发
        var host = req.headers.host,
            rurl = "https://" + req.headers.host + req.url,
            ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        console.log('client ip: '.blue + ip + ' , host: '.green + host);
        console.log("request URL: ".cyan + rurl);
        let p = proxyConfig.proxy.reverse().find(function (p) {
            var rule = new RegExp(p.path);
            return p.path && rule.exec(rurl);
        });
        if (p) {
            console.log("find rule for above url!")
            if (p.data) {
                //jsonp
                let callbackName = new RegExp("callback=(.*)&", "g").exec(req.url);
                if (callbackName && callbackName[1]) {
                    console.log("jsonp match given data! ".red);
                    res.writeHead(200, {
                        'Content-Type': 'application/json'
                    });
                    res.end(callbackName[1] + "(" + p.data + ")");
                } else {
                    console.log("ajax match given data! ".red);
                    res.writeHead(200, {
                        'Content-Type': 'application/json'
                    });
                    res.end(p.data);

                }

            } else if (p.routeTo) {
                console.log("proxy to: ".red + proxyConfig[p.routeTo]);
                proxyServer.web(req, res, {
                    target: proxyConfig[p.routeTo],
                    secure: false
                });
            } else {
                request(req, res)
            }
        } else {
            request(req, res)
        }
    }).listen(proxyConfig.httpsPort || PORT, () => console.log("https server run at " + proxyConfig.httpsPort || PORT));
}