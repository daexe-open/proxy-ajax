var http = require('http'); 
var net = require('net'); 
var url = require('url'); 

export let request =  function request(cReq, cRes) {
    var u = url.parse(cReq.url);
    var options = {
        hostname: u.hostname,
        port: u.port || 80,
        path: u.path,
        method: cReq.method,
        headers: cReq.headers
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

export let connect = function(cReq, cSock) {
    var u = url.parse('http://' + cReq.url);
    var pSock = net.connect(u.port, u.hostname, function () {
        cSock.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        pSock.pipe(cSock);
    }).on('error', function (e) {
        cSock.end();
    });
    cSock.pipe(pSock);

} 
