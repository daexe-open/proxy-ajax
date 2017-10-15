var http = require('http');
var net = require('net');
var url = require('url');
var fs = require('fs');
import {
    resolve,
    dirname,
    join
} from "path";
let currentDir = process.cwd();
export let handleRequest = function (request, response, defa) {

    var urlObject = url.parse(request.url, true);
    var pathname = decodeURIComponent(urlObject.pathname);
    console.log('[' + (new Date()).toUTCString() + '] ' + '"' + request.method + ' ' + pathname + '"');

    var filePath = join(currentDir, pathname);

    fs.stat(filePath, function (err, stats) {
        if (err) {
            response.writeHead(404, {});
            response.end('File not found!');
            return;
        }

        if (stats.isFile()) {
            fs.readFile(filePath, function (err, data) {
                if (err) {
                    response.writeHead(404, {});
                    response.end('Opps. Resource not found');
                    return;
                }

                if (filePath.indexOf("svg") > 0) {
                    response.writeHead(200, {
                        'Content-Type': 'image/svg+xml; charset=utf-8'
                    });
                } else {
                    response.writeHead(200, {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
                        "Access-Control-Allow-Methods": "PUT,POST,GET,DELETE,OPTIONS"
                    });
                }
                response.write(data);
                response.end();
            });

        } else if (stats.isDirectory()) {
            var filePathIndex = join(currentDir, pathname, defa);
            fs.exists(filePathIndex, function (exists) {
                if (exists) {
                    fs.readFile(filePathIndex, function (err, data) {
                        if (err) {
                            response.writeHead(404, {});
                            response.end('Opps. Resource not found');
                            return;
                        }
                        response.writeHead(200, {
                            "Access-Control-Allow-Origin": "*",
                            "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
                            "Access-Control-Allow-Methods": "PUT,POST,GET,DELETE,OPTIONS"
                        });
                        response.write(data);
                        response.end();
                    });
                } else {
                    fs.readdir(filePath, function (error, files) {
                        if (error) {
                            response.writeHead(500, {});
                            response.end();
                            return;
                        }
                        var l = pathname.length;
                        if (pathname.substring(l - 1) != '/') pathname += '/';


                        response.writeHead(200, {
                            'Content-Type': 'text/html'
                        });
                        response.write('<!DOCTYPE html>\n<html><head><meta charset="UTF-8"><title>' + filePath + '</title></head><body>');
                        response.write('<h1>' + filePath + '</h1>');
                        response.write('<ul style="list-style:none;font-family:courier new;">');
                        files.unshift('.', '..');
                        files.forEach(function (item) {

                            var urlpath, itemStats;
                            urlpath = pathname + item
                            itemStats = fs.statSync(currentDir + urlpath);

                            if (itemStats.isDirectory()) {
                                urlpath += '/';
                                item += '/';
                            }

                            response.write('<li><a href="' + urlpath + '">' + item + '</a></li>');
                        });

                        response.end('</ul></body></html>');
                    });
                }
            })
        }
    });

}

export let request = function request(cReq, cRes, rqurl) {
    var u = url.parse(rqurl || cReq.url);
    var options = {
        hostname: u.hostname,
        port: u.port || 80,
        path: u.path,
        method: cReq.method,
        headers: rqurl ? "" : cReq.headers
    };

    var pReq = http.request(options, function (pRes) {
        cRes.writeHead(pRes.statusCode, pRes.headers);
        pRes.pipe(cRes);
    }).on('error', function (e) {
        console.log(e)
        cRes.end();
    });
    cReq.pipe(pReq);

}

export let connect = function (cReq, cSock) {
    var u = url.parse('http://' + cReq.url);
    var pSock = net.connect(u.port, u.hostname, function () {
        cSock.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        pSock.pipe(cSock);
    }).on('error', function (e) {
        cSock.end();
    });
    cSock.pipe(pSock);

} 
