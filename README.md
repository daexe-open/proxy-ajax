## proxy-ajax
proxy-ajax can proxy the axaj request follow your config rules in you project. it's easy to proxy you project to test your program. it can also be used as http proxy, if your want to proxy your iphone or android network from your conputer, you can run the proxy-ajax, and the set the http proxy in you wifi setting.

## usage
```
npm install proxy-ajax -g
-------you can specify the config file path and port---
proxy-ajax ./.proxy-ajax.config.js -p 80

------- you can use the default config path and port---
proxy-ajax
```
the default config path： ./.proxy-ajax.config.js
the default port： 80

config file eample:
```
.proxy-ajax.config.js file:
--------------------------
module.exports = {
    "port": 8889,
    //"httpsPort": 8890, 
    //"cert": "", //https cert
    //"key": "", //https key
    "target-mtop": "https://x.x.x.x/",
    "target-other": "http://baidu.com",
    "proxy": [{
        "path": "getBaidu",
        "routeTo": "target-mtop"
    }]
}
```
if you don't want write many config file in your project, you can also write your proxyConfig in your other config file, just like this:
```
xxxx.config.js file:
--------------------------
var data = require("./data")
module.exports = {
    .....
    .....
    proxyConfig:{
        
        "port": 8889,
        // "httpsPort": 8890,
        "target-page": "http://127.0.0.1:3000/",
        "target-mtop": "https://x.x.x.x/",
        "target-static": "http://127.0.0.1:8000",
        "proxy": [{
            "path": "/h5/",
            "routeTo": "target-mtop"
        },{
            "path": "/h6/",
            "routeTo": "http://xxxxx/data.json"
        },{
            "path": "/h5/jianribimai",
            "data": "./src/demo/data/new3.js"
        },{
            "path": "/h5/test",
            "data": JSON.stringify(data)
        }]
    }
    ....
}
```
when it runs, you will see the proxy information in the console:
```
client ip: ::ffff:30.7.27.202 , host: iosapps.itunes.apple.com
request URL: http://iosapps.itunes.apple.com/apple-assets-us-std-000001/Purple111/v4/f2/a1/d3/f2a

connect g-assets.daily.taobao.net:443
......
```

## changelog
### 20170907 release 1.0.0
1. add route to http data directly support.
### 20170904 release 0.0.8
1. add https support.
2. support proxy http request to data, youcan set the data or just the data path.

### 20170701 release 0.0.7
1. modify the default config file ./.proxy-ajax.config to ./.proxy-ajax.config.js, because js file is easy to extend. but youcan also use your json file by specify the config file:
```
proxy-ajax ./.proxy-ajax.config
```
## LICENCE
MIT